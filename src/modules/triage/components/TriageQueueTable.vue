<script setup>
import { RouterLink } from 'vue-router'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'

import { triagePatientFullName } from '@/modules/triage/workflow/triage-create.workflow'
import {
  formatTriageWaitingDuration,
  triageWaitingPresentation,
} from '@/modules/triage/workflow/triage-dashboard.workflow'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canStart: {
    type: Boolean,
    default: false,
  },
})

function formatDate(value) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function patientTypeLabel(value) {
  const labels = {
    PUBLIC: 'Public',
    AGENT_CAC: 'Agent CAC',
    AYANT_DROIT: 'Ayant droit',
  }

  return labels[value] || value || '—'
}
</script>

<template>
  <div>
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patient
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Passage
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Arrivée
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Attente
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Paiement
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">
              Chargement de la file du triage...
            </td>
          </tr>

          <tr v-else-if="items.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">
              Aucun patient n’attend actuellement le triage.
            </td>
          </tr>

          <tr v-for="item in items" v-else :key="item.episode.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-semibold text-slate-950">
                {{ triagePatientFullName(item) || 'Patient' }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ item.patient.patientCode }} · {{ patientTypeLabel(item.reception.patientType) }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              <p>{{ item.episode.episodeCode }}</p>
              <p class="mt-1 text-xs text-slate-500">
                Réception {{ item.reception.receptionCode }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ formatDate(item.waitingSince) }}
            </td>

            <td class="px-4 py-4">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-slate-900">
                  {{ formatTriageWaitingDuration(item.waitingMinutes) }}
                </p>
                <BaseBadge
                  :variant="triageWaitingPresentation(item.waitingLevel).variant"
                >
                  {{ triageWaitingPresentation(item.waitingLevel).label }}
                </BaseBadge>
              </div>
            </td>

            <td class="px-4 py-4">
              <BaseBadge
                :variant="
                  !item.reception.paymentRequired || item.reception.paymentValidated
                    ? 'success'
                    : 'warning'
                "
              >
                {{
                  !item.reception.paymentRequired
                    ? 'Non requis'
                    : item.reception.paymentValidated
                      ? 'Validé'
                      : 'À vérifier'
                }}
              </BaseBadge>
            </td>

            <td class="px-4 py-4 text-right">
              <RouterLink
                v-if="canStart"
                :to="`/triage/create?episodeId=${item.episode.id}`"
              >
                <BaseButton variant="secondary" size="sm">
                  Commencer le triage
                </BaseButton>
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
        Chargement de la file du triage...
      </div>

      <div
        v-else-if="items.length === 0"
        class="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500"
      >
        Aucun patient n’attend actuellement le triage.
      </div>

      <article
        v-for="item in items"
        v-else
        :key="item.episode.id"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ triagePatientFullName(item) || 'Patient' }}
            </h3>
            <p class="mt-1 text-sm text-slate-500">
              {{ item.patient.patientCode }}
            </p>
          </div>

          <BaseBadge variant="primary">EN TRIAGE</BaseBadge>
        </div>

        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Épisode</dt>
            <dd class="font-medium text-slate-900">{{ item.episode.episodeCode }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Réception</dt>
            <dd class="font-medium text-slate-900">{{ item.reception.receptionCode }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Arrivée</dt>
            <dd class="font-medium text-slate-900">{{ formatDate(item.waitingSince) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Attente</dt>
            <dd class="text-right">
              <span class="block font-medium text-slate-900">
                {{ formatTriageWaitingDuration(item.waitingMinutes) }}
              </span>
              <BaseBadge
                class="mt-1"
                :variant="triageWaitingPresentation(item.waitingLevel).variant"
              >
                {{ triageWaitingPresentation(item.waitingLevel).label }}
              </BaseBadge>
            </dd>
          </div>
        </dl>

        <RouterLink
          v-if="canStart"
          class="mt-4 block"
          :to="`/triage/create?episodeId=${item.episode.id}`"
        >
          <BaseButton variant="secondary" class="w-full">
            Commencer le triage
          </BaseButton>
        </RouterLink>
      </article>
    </div>
  </div>
</template>
