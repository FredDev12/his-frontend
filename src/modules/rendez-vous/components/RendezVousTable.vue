<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import RendezVousStatusBadge from '@/modules/rendez-vous/components/RendezVousStatusBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  rendezVous: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['confirm', 'complete', 'cancel', 'remove'])

function fullName(item) {
  return [item.nom, item.postnom, item.prenom].filter(Boolean).join(' ') || '—'
}

function rdvDate(item) {
  if (!item.date_rdv) return '—'
  return formatDateTime(`${item.date_rdv}T${item.heure_rdv || '00:00'}`)
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
              Service
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Date
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Statut
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Motif
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
              Chargement des rendez-vous...
            </td>
          </tr>

          <tr v-else-if="rendezVous.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun rendez-vous trouvé.
            </td>
          </tr>

          <tr v-for="item in rendezVous" v-else :key="item.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">{{ fullName(item) }}</p>
              <p class="mt-1 text-xs text-slate-500">
                Patient N° {{ item.numero_patient }} · Fiche {{ item.numero_fiche }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.service || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ rdvDate(item) }}
            </td>

            <td class="px-4 py-4">
              <RendezVousStatusBadge :statut="item.statut" />
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.motif || '—' }}
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/rendez-vous/${item.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>

                <RouterLink :to="`/rendez-vous/${item.id}/edit`">
                  <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
                </RouterLink>

                <BaseButton
                  v-if="item.statut === 'scheduled'"
                  variant="success"
                  size="sm"
                  @click="$emit('confirm', item)"
                >
                  Confirmer
                </BaseButton>

                <BaseButton
                  v-if="['scheduled', 'confirmed'].includes(item.statut)"
                  variant="primary"
                  size="sm"
                  @click="$emit('complete', item)"
                >
                  Terminer
                </BaseButton>

                <BaseButton
                  v-if="item.statut !== 'cancelled'"
                  variant="warning"
                  size="sm"
                  @click="$emit('cancel', item)"
                >
                  Annuler
                </BaseButton>

                <BaseButton variant="danger" size="sm" @click="$emit('remove', item)">
                  Supprimer
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
