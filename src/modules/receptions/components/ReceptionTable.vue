<script setup>
import { computed } from 'vue'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import ReceptionStatusBadge from './ReceptionStatusBadge.vue'

const props = defineProps({
  receptions: {
    type: Array,
    default: () => [],
  },

  // Compatibilité avec les pages utilisant encore :items.
  items: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },

  canView: {
    type: Boolean,
    default: true,
  },

  canRemove: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view', 'remove'])

const rows = computed(() =>
  props.receptions.length > 0 ? props.receptions : props.items,
)

function patientName(reception) {
  const patient = reception?.patient || reception?.raw?.patient || {}

  const name = [
    reception?.nom ?? patient.lastName,
    reception?.postnom ?? patient.middleName,
    reception?.prenom ?? patient.firstName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return name || 'Patient non renseigné'
}

function patientCode(reception) {
  return (
    reception?.patientCode ||
    reception?.numero_patient ||
    reception?.patient?.patientCode ||
    reception?.raw?.patient?.patientCode ||
    '—'
  )
}

function receptionCode(reception) {
  return reception?.receptionCode || reception?.numero_fiche || '—'
}

function destinationLabel(reception) {
  return (
    reception?.service ||
    reception?.requestedService?.name ||
    reception?.raw?.requestedService?.name ||
    reception?.orientation?.targetModule ||
    reception?.raw?.orientation?.targetModule ||
    'TRIAGE'
  )
}

function addressLabel(reception) {
  return (
    reception?.adresse ||
    reception?.patient?.address ||
    reception?.raw?.patient?.address ||
    'Non renseignée'
  )
}


function paymentLabel(reception) {
  if (!reception?.paymentRequired) return 'Non requis'
  return reception?.paymentValidated ? 'Payé' : 'À payer'
}

function paymentVariant(reception) {
  if (!reception?.paymentRequired) return 'neutral'
  return reception?.paymentValidated ? 'success' : 'warning'
}


function canCancelReception(reception) {
  const receptionStatus = reception?.status || reception?.statut
  const episodeStatus =
    reception?.episode?.status ||
    reception?.raw?.episode?.status ||
    reception?.episodeStatus

  return (
    props.canRemove &&
    receptionStatus === 'ADMIS' &&
    episodeStatus === 'EN_TRIAGE'
  )
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
</script>

<template>
  <section aria-label="Liste des réceptions">
    <div
      v-if="loading"
      class="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600"
      role="status"
      aria-live="polite"
    >
      Chargement des réceptions…
    </div>

    <div
      v-else-if="rows.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"
    >
      <p class="font-semibold text-slate-800">Aucune réception trouvée</p>
      <p class="mt-1 text-sm text-slate-500">
        Modifiez les critères de recherche ou créez une nouvelle réception.
      </p>
    </div>

    <template v-else>
      <!-- Desktop et tablette -->
      <div class="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Patient
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Réception
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Destination
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Adresse
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Paiement
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Statut
                </th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 bg-white">
              <tr
                v-for="reception in rows"
                :key="reception.id"
                class="align-top hover:bg-slate-50"
              >
                <td class="px-4 py-4">
                  <p class="font-semibold text-slate-900">{{ patientName(reception) }}</p>
                  <p class="mt-1 text-xs text-slate-500">ID : {{ patientCode(reception) }}</p>
                </td>

                <td class="px-4 py-4">
                  <p class="font-medium text-slate-800">{{ receptionCode(reception) }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ formatDate(reception.created_at || reception.createdAt) }}</p>
                </td>

                <td class="px-4 py-4 text-sm text-slate-700">
                  {{ destinationLabel(reception) }}
                </td>

                <td class="max-w-xs px-4 py-4 text-sm text-slate-700">
                  <span class="line-clamp-2">{{ addressLabel(reception) }}</span>
                </td>

                <td class="px-4 py-4">
                  <BaseBadge :variant="paymentVariant(reception)">
                    {{ paymentLabel(reception) }}
                  </BaseBadge>
                </td>

                <td class="px-4 py-4">
                  <ReceptionStatusBadge :status="reception.status || reception.statut" />
                </td>

                <td class="px-4 py-4">
                  <div class="flex justify-end gap-2">
                    <BaseButton
                      v-if="canView"
                      variant="ghost"
                      type="button"
                      @click="emit('view', reception)"
                    >
                      Voir
                    </BaseButton>

                    <BaseButton
                      v-if="canCancelReception(reception)"
                      variant="warning"
                      type="button"
                      @click="emit('remove', reception)"
                    >
                      Annuler
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile -->
      <div class="grid gap-3 md:hidden">
        <article
          v-for="reception in rows"
          :key="reception.id"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <header class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-semibold text-slate-900">{{ patientName(reception) }}</h3>
              <p class="mt-1 text-xs text-slate-500">ID : {{ patientCode(reception) }}</p>
            </div>
            <ReceptionStatusBadge :status="reception.status || reception.statut" />
          </header>

          <dl class="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Réception</dt>
              <dd class="mt-1 text-slate-800">{{ receptionCode(reception) }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Destination</dt>
              <dd class="mt-1 text-slate-800">{{ destinationLabel(reception) }}</dd>
            </div>

            <div class="col-span-2">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Adresse</dt>
              <dd class="mt-1 text-slate-800">{{ addressLabel(reception) }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Paiement</dt>
              <dd class="mt-1">
                <BaseBadge :variant="paymentVariant(reception)">
                  {{ paymentLabel(reception) }}
                </BaseBadge>
              </dd>
            </div>
          </dl>

          <div class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <BaseButton
              v-if="canView"
              variant="ghost"
              type="button"
              @click="emit('view', reception)"
            >
              Voir
            </BaseButton>

            <BaseButton
              v-if="canCancelReception(reception)"
              variant="warning"
              type="button"
              @click="emit('remove', reception)"
            >
              Annuler
            </BaseButton>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>


