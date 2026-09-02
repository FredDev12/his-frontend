<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import TriageIdentityCard from '@/modules/triage/components/TriageIdentityCard.vue'
import TriagePriorityBadge from '@/modules/triage/components/TriagePriorityBadge.vue'
import TriageReevaluationForm from '@/modules/triage/components/TriageReevaluationForm.vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useTriageStore } from '@/modules/triage/stores/triage.store'
import { patientDisplayName } from '@/shared/utils/patient'
import {
  formatTriageDateTime,
  isVitalTriagePriority,
  triageOrientationLabel,
  triagePriorityPresentation,
  triageTypeLabel,
} from '@/modules/triage/workflow/triage-create.workflow'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useTriageStore()
const triageId = computed(() => route.params.id)
const triage = computed(() => store.selectedTriage)
const priority = computed(() => triagePriorityPresentation(triage.value?.priorite))

const showReevaluationForm = ref(false)
const confirmationOpen = ref(false)
const pendingReevaluation = ref(null)

const canReevaluate = computed(
  () =>
    auth.hasPermission('triage:update') &&
    triage.value?.episode_status ===
      'EN_ATTENTE_CONSULTATION',
)

const vitalReevaluation = computed(() =>
  isVitalTriagePriority(
    pendingReevaluation.value?.newPriority,
  ),
)

onMounted(async () => {
  try {
    await Promise.all([
      store.fetchTriageById(triageId.value),
      store.fetchReevaluations(triageId.value),
    ])
  } catch {
    router.push('/triage')
  }
})

function dash(value, suffix = '') {
  if (value === null || value === undefined || value === '') return '—'
  return `${value}${suffix}`
}

function actorName(actor) {
  if (!actor) return '—'
  return [actor.lastName, actor.firstName].filter(Boolean).join(' ') || actor.email || '—'
}

function askReevaluationConfirmation(payload) {
  pendingReevaluation.value = payload
  confirmationOpen.value = true
}

function closeReevaluationConfirmation() {
  if (store.reevaluationSaving) return

  confirmationOpen.value = false
  pendingReevaluation.value = null
}

async function confirmReevaluation() {
  if (!pendingReevaluation.value) return

  const payload = {
    ...pendingReevaluation.value,
    vitalEmergencyConfirmed:
      vitalReevaluation.value,
  }

  try {
    await store.createReevaluation(
      triageId.value,
      payload,
    )

    await Promise.all([
      store.fetchTriageById(triageId.value),
      store.fetchReevaluations(triageId.value),
    ])

    showReevaluationForm.value = false
    closeReevaluationConfirmation()
  } catch {
    // Le store affiche le message d’erreur.
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail du triage</h1>
        <p class="his-page-subtitle">Triage validé, traçable et consultable en lecture seule.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-if="canReevaluate"
          variant="primary"
          @click="showReevaluationForm = true"
        >
          Réévaluer le patient
        </BaseButton>

        <RouterLink to="/triage">
          <BaseButton variant="secondary">
            Retour à la file
          </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">Chargement du triage...</div>

    <div v-else-if="triage" class="space-y-6">
      <TriageIdentityCard :triage="triage" />

      <BaseCard title="Évaluation initiale" subtitle="Motif, contexte du passage et priorité décidée par l’infirmier.">
        <div class="rounded-xl bg-slate-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Motif initial</p>
          <p class="mt-2 text-sm leading-6 text-slate-800">{{ dash(triage.motif_initial) }}</p>
        </div>
        <dl class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Type de passage</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ triageTypeLabel(triage.type_passage) }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Priorité clinique</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ priority.label }}</dd>
            <p class="mt-1 text-sm text-slate-500">{{ priority.description }}</p>
          </div>
        </dl>
      </BaseCard>

      <BaseCard title="Constantes vitales" subtitle="Mesures enregistrées au moment du triage.">
        <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div v-for="item in [
            ['Température', dash(triage.temperature, ' °C')],
            ['Tension', dash(triage.tension_arterielle)],
            ['Fréquence cardiaque', dash(triage.frequence_cardiaque, ' /min')],
            ['Fréquence respiratoire', dash(triage.frequence_respiratoire, ' /min')],
            ['Saturation SpO₂', dash(triage.spo2, ' %')],
            ['Poids', dash(triage.poids, ' kg')],
            ['Taille', dash(triage.taille, ' cm')],
            ['Glycémie', dash(triage.glycemie, ' mg/dL')],
            ['Douleur', dash(triage.douleur, '/10')],
          ]" :key="item[0]" class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ item[0] }}</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ item[1] }}</dd>
          </div>
        </dl>
      </BaseCard>

      <BaseCard title="Premiers soins" subtitle="Interventions réalisées avant l’orientation.">
        <div class="flex items-start gap-3">
          <BaseBadge :variant="triage.first_aid_performed ? 'warning' : 'neutral'">
            {{ triage.first_aid_performed ? 'Premiers soins réalisés' : 'Aucun premier soin déclaré' }}
          </BaseBadge>
          <p class="text-sm leading-6 text-slate-700">{{ triage.first_aid_performed ? dash(triage.first_aid_notes) : '—' }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Orientation enregistrée" subtitle="La destination validée ne peut pas être contournée depuis cette page.">
        <dl class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Service clinique</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ dash(triage.service_entree) }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Destination</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ triageOrientationLabel(triage.orientation_target_module) }}</dd>
          </div>
          <div v-if="triage.appointment_required" class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Rendez-vous</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ formatTriageDateTime(triage.appointment_date_time) }}</dd>
          </div>
        </dl>
      </BaseCard>


      <TriageReevaluationForm
        v-if="showReevaluationForm && canReevaluate"
        :triage="triage"
        :loading="store.reevaluationSaving"
        @submit="askReevaluationConfirmation"
        @cancel="showReevaluationForm = false"
      />

      <BaseCard
        title="Historique des réévaluations"
        subtitle="Chaque mesure est conservée avec son auteur et son horodatage."
      >
        <div
          v-if="store.reevaluationLoading"
          class="py-8 text-center text-sm text-slate-500"
        >
          Chargement de l’historique...
        </div>

        <div
          v-else-if="store.reevaluations.length === 0"
          class="py-8 text-center text-sm text-slate-500"
        >
          Aucune réévaluation enregistrée.
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="item in store.reevaluations"
            :key="item.id"
            class="rounded-xl border border-slate-200 p-4"
          >
            <div class="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <p class="font-semibold text-slate-950">
                  Réévaluation #{{ item.sequenceNumber }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ formatTriageDateTime(item.createdAt) }}
                  · {{ actorName(item.createdByUser) }}
                </p>
              </div>

              <TriagePriorityBadge :priorite="item.newPriority" />
            </div>

            <p class="mt-3 text-sm leading-6 text-slate-700">
              {{ item.clinicalNotes }}
            </p>

            <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt class="text-slate-500">Température</dt>
                <dd class="font-medium">
                  {{ item.temperatureCelsius }} °C
                </dd>
              </div>
              <div>
                <dt class="text-slate-500">Fréquence cardiaque</dt>
                <dd class="font-medium">
                  {{ item.heartRate }} /min
                </dd>
              </div>
              <div>
                <dt class="text-slate-500">SpO₂</dt>
                <dd class="font-medium">
                  {{ item.oxygenSaturation }} %
                </dd>
              </div>
            </dl>

            <BaseBadge
              v-if="item.emergencyEscalated"
              class="mt-3"
              variant="emergency"
            >
              Urgence vitale activée
            </BaseBadge>
          </article>
        </div>
      </BaseCard>

      <ConfirmDialog
        :open="confirmationOpen"
        :title="
          vitalReevaluation
            ? 'Activer immédiatement l’urgence vitale'
            : 'Confirmer la réévaluation clinique'
        "
        :message="
          vitalReevaluation
            ? 'Le patient sera orienté immédiatement vers le service Urgences.'
            : 'Vérifiez les nouvelles constantes et la priorité.'
        "
        :patient-name="patientDisplayName(triage, triage.numero_patient)"
        :patient-id="triage.numero_patient"
        :consequence="
          vitalReevaluation
            ? 'Cette action active un parcours d’urgence vitale et crée un audit critique.'
            : 'La réévaluation mettra à jour les constantes courantes tout en conservant l’historique.'
        "
        :confirm-text="
          vitalReevaluation
            ? 'Activer immédiatement'
            : 'Enregistrer la réévaluation'
        "
        :require-text="vitalReevaluation ? '' : 'CONFIRMER'"
        :variant="vitalReevaluation ? 'emergency' : 'success'"
        :loading="store.reevaluationSaving"
        @close="closeReevaluationConfirmation"
        @confirm="confirmReevaluation"
      />

      <BaseCard title="Traçabilité" subtitle="Auteur, date de validation et statut clinique.">
        <dl class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Code triage</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ dash(triage.triage_code) }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Réalisé par</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ actorName(triage.created_by) }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Validé le</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ formatTriageDateTime(triage.created_at) }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Statut</dt>
            <dd class="mt-1 font-semibold text-slate-950">{{ dash(triage.statut) }}</dd>
          </div>
        </dl>
      </BaseCard>
    </div>
  </div>
</template>
