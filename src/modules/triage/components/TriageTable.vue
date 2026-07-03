<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import TriagePriorityBadge from '@/modules/triage/components/TriagePriorityBadge.vue'

defineProps({
  canMarkUrgent: { type: Boolean, default: false },
  canRemove: { type: Boolean, default: false },
  triages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['remove', 'status'])

function fullName(triage) {
  return [triage.nom, triage.postnom, triage.prenom].filter(Boolean).join(' ') || '—'
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Patient
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Signes vitaux
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Service
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Passage
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Priorité
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des triages...
            </td>
          </tr>

          <tr v-else-if="triages.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun triage trouvé.
            </td>
          </tr>

          <tr v-for="triage in triages" v-else :key="triage.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">{{ fullName(triage) }}</p>
              <p class="mt-1 text-xs text-slate-500">
                Patient N° {{ triage.numero_patient }} · Fiche {{ triage.numero_fiche }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              <p>T° {{ triage.temperature || '—' }} · TA {{ triage.tension_arterielle || '—' }}</p>
              <p class="mt-1 text-xs text-slate-500">
                FC {{ triage.frequence_cardiaque || '—' }} · SpO2 {{ triage.spo2 || '—' }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">{{ triage.service_entree }}</td>
            <td class="px-4 py-4 text-sm text-slate-600">{{ triage.type_passage }}</td>

            <td class="px-4 py-4">
              <TriagePriorityBadge :priorite="triage.priorite" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/triage/${triage.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>

                <RouterLink :to="`/triage/${triage.id}/edit`">
                  <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
                </RouterLink>

                <BaseButton
                  variant="emergency"
                  size="sm"
                  v-if="canMarkUrgent" @click="$emit('status', triage)"
                >
                  Marquer urgent
                </BaseButton>

                <BaseButton variant="danger" size="sm" v-if="canRemove" @click="$emit('remove', triage)">
                  Supprimer
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        Chargement des triages...
      </div>

      <div
        v-else-if="triages.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucun triage trouvé.
      </div>

      <article
        v-for="triage in triages"
        v-else
        :key="triage.id"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">{{ fullName(triage) }}</h3>
            <p class="mt-1 text-sm text-slate-500">Fiche {{ triage.numero_fiche }}</p>
          </div>

          <TriagePriorityBadge :priorite="triage.priorite" />
        </div>

        <div class="mt-4 space-y-1 text-sm text-slate-600">
          <p>
            Service : <span class="font-medium text-slate-900">{{ triage.service_entree }}</span>
          </p>
          <p>
            TA :
            <span class="font-medium text-slate-900">{{ triage.tension_arterielle || '—' }}</span>
          </p>
          <p>
            SpO2 : <span class="font-medium text-slate-900">{{ triage.spo2 || '—' }}</span>
          </p>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="`/triage/${triage.id}`">
            <BaseButton variant="secondary" size="sm">Voir</BaseButton>
          </RouterLink>

          <RouterLink :to="`/triage/${triage.id}/edit`">
            <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
          </RouterLink>

          <BaseButton variant="danger" size="sm" v-if="canRemove" @click="$emit('remove', triage)">
            Supprimer
          </BaseButton>
        </div>
      </article>
    </div>
  </div>
</template>



