<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
} from 'vue'
import { RouterLink } from 'vue-router'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import TriagePriorityBadge from '@/modules/triage/components/TriagePriorityBadge.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useTriageStore } from '@/modules/triage/stores/triage.store'
import { patientDisplayName } from '@/shared/utils/patient'
import {
  triagePatientFullName,
} from '@/modules/triage/workflow/triage-create.workflow'
import {
  formatDashboardDateTime,
  formatTriageWaitingDuration,
  triageWaitingPresentation,
} from '@/modules/triage/workflow/triage-dashboard.workflow'

const auth = useAuthStore()
const store = useTriageStore()

let refreshTimer = null

const dashboard = computed(() => store.dashboard)
const priorityTotal = computed(
  () => dashboard.value.today.priorities.priorityTotal,
)

function triagePatientName(item) {
  return patientDisplayName(item, item?.numero_patient)
}

async function refreshDashboard() {
  try {
    await store.fetchDashboard()
  } catch {
    // L'erreur est affichée par l'état dashboardError.
  }
}

onMounted(async () => {
  await refreshDashboard()

  refreshTimer = window.setInterval(
    refreshDashboard,
    60_000,
  )
})

onUnmounted(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">Service Triage</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Triage infirmier</h1>

        <p class="his-page-subtitle">
          File actuelle, délais d’attente et activité infirmière de la journée.
        </p>

        <p class="mt-2 text-xs text-slate-500">
          Dernière actualisation :
          {{ formatDashboardDateTime(dashboard.generatedAt) }}
          · actualisation automatique toutes les 60 secondes
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <BaseButton
          variant="secondary"
          :loading="store.dashboardLoading"
          loading-text="Actualisation..."
          @click="refreshDashboard"
        >
          Actualiser
        </BaseButton>

        <RouterLink
          v-if="auth.hasPermission('triage:read')"
          to="/triage"
        >
          <BaseButton variant="primary">
            Ouvrir la file du triage
          </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div
      v-if="store.dashboardError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.dashboardError }}
    </div>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <BaseCard title="Patients en attente">
        <p class="text-3xl font-bold text-slate-950">
          {{ dashboard.queue.total }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          File officielle actuelle
        </p>
      </BaseCard>

      <BaseCard title="À surveiller">
        <p class="text-3xl font-bold text-amber-600">
          {{ dashboard.queue.watchCount }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Entre {{ dashboard.queue.watchThresholdMinutes }} et
          {{ dashboard.queue.prolongedThresholdMinutes - 1 }} min
        </p>
      </BaseCard>

      <BaseCard title="Attente prolongée">
        <p class="text-3xl font-bold text-red-700">
          {{ dashboard.queue.prolongedCount }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Au moins {{ dashboard.queue.prolongedThresholdMinutes }} min
        </p>
      </BaseCard>

      <BaseCard title="Triages aujourd’hui">
        <p class="text-3xl font-bold text-emerald-700">
          {{ dashboard.today.totalTriages }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Validations de la journée locale
        </p>
      </BaseCard>

      <BaseCard title="Cas prioritaires">
        <p class="text-3xl font-bold text-rose-700">
          {{ priorityTotal }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Urgent, très urgent ou vital
        </p>
      </BaseCard>

      <BaseCard title="Orientations">
        <p class="text-2xl font-bold text-blue-700">
          {{ dashboard.today.orientations.immediateConsultations }}
          /
          {{ dashboard.today.orientations.appointments }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Consultations / rendez-vous
        </p>
      </BaseCard>
    </section>

    <div
      class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Les seuils de 30 et 60 minutes sont des alertes de délai
      opérationnelles. Ils ne déterminent jamais la priorité clinique,
      qui reste décidée par l’infirmier après évaluation.
    </div>

    <section class="grid gap-6 xl:grid-cols-2">
      <BaseCard
        title="Patients les plus anciens dans la file"
        subtitle="Les patients restent classés selon l’heure réelle d’arrivée."
      >
        <div
          v-if="store.dashboardLoading && dashboard.queue.items.length === 0"
          class="py-10 text-center text-sm text-slate-500"
        >
          Chargement de la file...
        </div>

        <div
          v-else-if="dashboard.queue.items.length === 0"
          class="py-10 text-center text-sm text-slate-500"
        >
          Aucun patient n’attend actuellement le triage.
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="item in dashboard.queue.items"
            :key="item.episode.id"
            class="rounded-xl border border-slate-200 p-4"
          >
            <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p class="font-semibold text-slate-950">
                  {{ triagePatientFullName(item) || 'Patient' }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ item.patient.patientCode }}
                  · {{ item.episode.episodeCode }}
                </p>
              </div>

              <BaseBadge
                :variant="triageWaitingPresentation(item.waitingLevel).variant"
              >
                {{ triageWaitingPresentation(item.waitingLevel).label }}
              </BaseBadge>
            </div>

            <div class="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p class="text-sm text-slate-600">
                Attente :
                <strong>
                  {{ formatTriageWaitingDuration(item.waitingMinutes) }}
                </strong>
              </p>

              <RouterLink
                v-if="auth.hasPermission('triage:create')"
                :to="`/triage/create?episodeId=${item.episode.id}`"
              >
                <BaseButton variant="secondary" size="sm">
                  Commencer le triage
                </BaseButton>
              </RouterLink>
            </div>
          </article>
        </div>
      </BaseCard>

      <BaseCard
        title="Cas prioritaires triés aujourd’hui"
        subtitle="Priorités cliniques enregistrées après évaluation infirmière."
      >
        <div
          v-if="dashboard.priorityTriages.length === 0"
          class="py-10 text-center text-sm text-slate-500"
        >
          Aucun cas prioritaire trié aujourd’hui.
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="item in dashboard.priorityTriages"
            :key="item.id"
            class="rounded-xl border border-slate-200 p-4"
          >
            <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p class="font-semibold text-slate-950">
                  {{ triagePatientName(item) }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ item.numero_patient }}
                  · {{ item.numero_fiche }}
                </p>
              </div>

              <TriagePriorityBadge :priorite="item.priorite" />
            </div>

            <div class="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p class="text-sm text-slate-600">
                {{ item.service_entree }}
                · {{ formatDashboardDateTime(item.created_at) }}
              </p>

              <RouterLink :to="`/triage/${item.id}`">
                <BaseButton variant="secondary" size="sm">
                  Consulter
                </BaseButton>
              </RouterLink>
            </div>
          </article>
        </div>
      </BaseCard>
    </section>

    <BaseCard
      title="Patients en attente après triage"
      subtitle="Temps écoulé depuis la dernière évaluation. Aucun délai clinique obligatoire n’est déduit automatiquement."
    >
      <div
        v-if="dashboard.reassessment.items.length === 0"
        class="py-10 text-center text-sm text-slate-500"
      >
        Aucun patient trié n’attend actuellement une consultation.
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <article
          v-for="item in dashboard.reassessment.items"
          :key="item.id"
          class="rounded-xl border border-slate-200 p-4"
        >
          <div class="flex flex-col justify-between gap-3 sm:flex-row">
            <div>
              <p class="font-semibold text-slate-950">
                {{ triagePatientName(item) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ item.numero_patient }}
                · {{ item.numero_fiche }}
              </p>
            </div>

            <TriagePriorityBadge :priorite="item.priorite" />
          </div>

          <p class="mt-3 text-sm text-slate-600">
            Dernière évaluation :
            {{ formatDashboardDateTime(item.raw?.updatedAt) }}
          </p>

          <div class="mt-3 text-right">
            <RouterLink :to="`/triage/${item.id}`">
              <BaseButton variant="secondary" size="sm">
                Consulter ou réévaluer
              </BaseButton>
            </RouterLink>
          </div>
        </article>
      </div>
    </BaseCard>

    <BaseCard
      title="Derniers triages réalisés aujourd’hui"
      subtitle="Historique récent de la journée locale."
    >
      <div
        v-if="dashboard.recentTriages.length === 0"
        class="py-10 text-center text-sm text-slate-500"
      >
        Aucun triage validé aujourd’hui.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Patient
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Priorité
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Service
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Heure
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 bg-white">
            <tr
              v-for="item in dashboard.recentTriages"
              :key="item.id"
            >
              <td class="px-4 py-4">
                <p class="font-semibold text-slate-950">
                  {{ triagePatientName(item) }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ item.numero_patient }}
                </p>
              </td>

              <td class="px-4 py-4">
                <TriagePriorityBadge :priorite="item.priorite" />
              </td>

              <td class="px-4 py-4 text-sm text-slate-600">
                {{ item.service_entree }}
              </td>

              <td class="px-4 py-4 text-sm text-slate-600">
                {{ formatDashboardDateTime(item.created_at) }}
              </td>

              <td class="px-4 py-4 text-right">
                <RouterLink :to="`/triage/${item.id}`">
                  <BaseButton variant="secondary" size="sm">
                    Consulter
                  </BaseButton>
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>
