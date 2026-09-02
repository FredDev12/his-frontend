<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import ConsultationStatusBadge from '@/modules/consultations/components/ConsultationStatusBadge.vue'
import { patientDisplayName } from '@/shared/utils/patient'

defineProps({
  consultations: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

function fullName(consultation) {
  return patientDisplayName(
    {
      nom: consultation.nom,
      postnom: consultation.postnom,
      prenom: consultation.prenom,
    },
    consultation.numero_patient,
  )
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patient
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Plaintes
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Diagnostic
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Service
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Statut
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Action
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des consultations...
            </td>
          </tr>

          <tr v-else-if="consultations.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucune consultation trouvée.
            </td>
          </tr>

          <tr
            v-for="consultation in consultations"
            v-else
            :key="consultation.id"
            class="hover:bg-slate-50"
          >
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(consultation) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Patient {{ consultation.numero_patient }} ·
                Fiche {{ consultation.numero_fiche }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ consultation.plaintes || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ consultation.diagnostique || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ consultation.service || '—' }}
            </td>

            <td class="px-4 py-4">
              <ConsultationStatusBadge :statut="consultation.statut" />
            </td>

            <td class="px-4 py-4 text-right">
              <RouterLink :to="`/consultations/${consultation.id}`">
                <BaseButton variant="secondary" size="sm">
                  Consulter
                </BaseButton>
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div
        v-if="loading"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Chargement des consultations...
      </div>

      <div
        v-else-if="consultations.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucune consultation trouvée.
      </div>

      <article
        v-for="consultation in consultations"
        v-else
        :key="consultation.id"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ fullName(consultation) }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              Fiche {{ consultation.numero_fiche }}
            </p>
          </div>

          <ConsultationStatusBadge :statut="consultation.statut" />
        </div>

        <p class="mt-4 text-sm text-slate-600">
          Diagnostic :
          <span class="font-medium text-slate-900">
            {{ consultation.diagnostique || '—' }}
          </span>
        </p>

        <RouterLink
          class="mt-4 block"
          :to="`/consultations/${consultation.id}`"
        >
          <BaseButton variant="secondary" class="w-full">
            Consulter
          </BaseButton>
        </RouterLink>
      </article>
    </div>
  </div>
</template>
