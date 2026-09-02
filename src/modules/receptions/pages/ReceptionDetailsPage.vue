<script setup>
import { computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ReceptionIdentityCard from '@/modules/receptions/components/ReceptionIdentityCard.vue'
import ReceptionHistoryCard from '@/modules/receptions/components/ReceptionHistoryCard.vue'

import { useReceptionsStore } from '@/modules/receptions/stores/receptions.store'

const route = useRoute()
const router = useRouter()
const store = useReceptionsStore()

const receptionId = computed(() => route.params.id)
const reception = computed(() => store.selectedReception)

const isCancelled = computed(() =>
  ['ANNULE', 'ANNULEE'].includes(reception.value?.status || reception.value?.statut),
)

const paymentStatus = computed(
  () => reception.value?.fichePayment?.status || reception.value?.paymentDisplayStatus || 'PENDING',
)

const paymentStatusLabel = computed(() => {
  const labels = {
    NOT_REQUIRED: 'Frais non requis',
    PAID: 'Paiement validé',
    PENDING: 'Paiement à régulariser',
    INCONSISTENT: 'Paiement à vérifier',
  }

  return labels[paymentStatus.value] || 'Paiement à vérifier'
})

const paymentStatusVariant = computed(() => {
  const variants = {
    NOT_REQUIRED: 'neutral',
    PAID: 'success',
    PENDING: 'warning',
    INCONSISTENT: 'danger',
  }

  return variants[paymentStatus.value] || 'warning'
})

const workflowLabel = computed(() => {
  if (isCancelled.value) return 'Réception annulée'
  if (reception.value?.workflow?.transmittedToTriage) return 'Transmis au triage'
  return 'Transmission au triage en attente'
})

const workflowVariant = computed(() => {
  if (isCancelled.value) return 'danger'
  return reception.value?.workflow?.transmittedToTriage ? 'success' : 'warning'
})

function formatMoney(amount, currency) {
  if (amount === undefined || amount === null || amount === '') return '—'

  const numericAmount = Number(amount)

  if (Number.isNaN(numericAmount)) {
    return `${amount} ${currency || ''}`.trim()
  }

  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(numericAmount)} ${currency || ''}`.trim()
}

function paymentModeLabel(mode) {
  const labels = {
    CASH: 'Espèces',
    MOBILE_MONEY: 'Mobile Money',
  }

  return labels[mode] || mode || '—'
}

async function loadReception(id) {
  store.clearPatientHistory()

  try {
    const loadedReception = await store.fetchReceptionById(id)
    const patientId =
      loadedReception?.patient?.id ||
      loadedReception?.raw?.patient?.id ||
      null

    if (patientId) {
      await store.fetchPatientHistory(patientId, { limit: 5 })
    }
  } catch {
    router.push('/receptions')
  }
}

async function loadMoreHistory() {
  const patientId =
    reception.value?.patient?.id ||
    reception.value?.raw?.patient?.id ||
    null

  if (!patientId) return

  await store.fetchPatientHistory(patientId, {
    limit: Math.min(store.patientHistoryLimit + 10, 100),
  })
}

watch(
  receptionId,
  (id) => {
    if (id) loadReception(id)
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail réception</h1>
        <p class="his-page-subtitle">
          Consultation administrative de la réception, du paiement et de la transmission au triage.
        </p>
      </div>

      <RouterLink to="/receptions">
        <BaseButton variant="secondary">Retour à la liste</BaseButton>
      </RouterLink>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la réception...
    </div>

    <div
      v-else-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ store.error }}
    </div>

    <div v-else-if="reception" class="space-y-6">
      <div
        v-if="isCancelled"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        Cette réception est annulée. Elle est conservée uniquement pour consultation et audit.
      </div>

      <ReceptionIdentityCard :reception="reception" />

      <section class="grid gap-6 xl:grid-cols-2">
        <BaseCard
          title="Parcours administratif"
          subtitle="État de la transmission du passage vers le triage."
        >
          <dl class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Destination
              </dt>
              <dd class="mt-2 font-semibold text-slate-900">
                {{ reception.workflow?.destination || reception.service || 'TRIAGE' }}
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Transmission
              </dt>
              <dd class="mt-2">
                <BaseBadge :variant="workflowVariant">
                  {{ workflowLabel }}
                </BaseBadge>
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Épisode
              </dt>
              <dd class="mt-2 font-semibold text-slate-900">
                {{ reception.numero_episode || '—' }}
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Statut de l’épisode
              </dt>
              <dd class="mt-2 font-semibold text-slate-900">
                {{ reception.episode?.status || '—' }}
              </dd>
            </div>
          </dl>

          <p class="mt-4 text-sm leading-6 text-slate-600">
            La Réception ne réalise ni le triage clinique ni l’ouverture directe d’une consultation.
            La priorité, le motif médical et le service demandé sont renseignés par l’infirmier de triage.
          </p>
        </BaseCard>

        <BaseCard
          title="Frais d’ouverture de fiche"
          subtitle="Informations financières enregistrées dans la transaction d’admission."
        >
          <div class="mb-4">
            <BaseBadge :variant="paymentStatusVariant">
              {{ paymentStatusLabel }}
            </BaseBadge>
          </div>

          <div v-if="paymentStatus === 'NOT_REQUIRED'" class="text-sm leading-6 text-slate-600">
            Aucun frais d’ouverture n’était requis pour cette réception.
          </div>

          <dl v-else class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Montant</dt>
              <dd class="mt-2 font-semibold text-slate-900">
                {{
                  formatMoney(
                    reception.fichePayment?.paiement?.amount ||
                      reception.fichePayment?.facture?.amount,
                    reception.fichePayment?.paiement?.currency ||
                      reception.fichePayment?.facture?.currency,
                  )
                }}
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mode de paiement
              </dt>
              <dd class="mt-2 font-semibold text-slate-900">
                {{ paymentModeLabel(reception.fichePayment?.paiement?.mode) }}
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Facture</dt>
              <dd class="mt-2 break-all font-semibold text-slate-900">
                {{ reception.fichePayment?.facture?.factureNumber || '—' }}
              </dd>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Reçu</dt>
              <dd class="mt-2 break-all font-semibold text-slate-900">
                {{ reception.fichePayment?.paiement?.receiptNumber || '—' }}
              </dd>
            </div>

            <div
              v-if="reception.fichePayment?.paiement?.mode === 'MOBILE_MONEY'"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2"
            >
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Référence Mobile Money
              </dt>
              <dd class="mt-2 font-semibold text-slate-900">
                {{ reception.fichePayment?.paiement?.mobileMoneyProvider || '—' }}
                · {{ reception.fichePayment?.paiement?.payerPhone || '—' }}
                · {{ reception.fichePayment?.paiement?.reference || '—' }}
              </dd>
            </div>
          </dl>
        </BaseCard>
      </section>

      <BaseCard
        title="Coordonnées et contact d’urgence"
        subtitle="Informations de la fiche patient permanente."
      >
        <dl class="grid gap-4 md:grid-cols-2">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Adresse</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ reception.adresse || '—' }}</dd>
          </div>

          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
              Contact d’urgence
            </dt>
            <dd class="mt-1 text-sm text-slate-800">
              {{ reception.emergencyContactName || '—' }}
              · {{ reception.emergencyContactPhone || '—' }}
            </dd>
          </div>
        </dl>
      </BaseCard>

      <ReceptionHistoryCard
        :items="store.patientHistory"
        :loading="store.patientHistoryLoading"
        :error="store.patientHistoryError"
        :total="store.patientHistoryTotal"
        :current-reception-id="reception.id"
        @load-more="loadMoreHistory"
      />
    </div>
  </div>
</template>
