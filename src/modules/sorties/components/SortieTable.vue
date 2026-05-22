<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import SortieStatusBadge from '@/modules/sorties/components/SortieStatusBadge.vue'

defineProps({
  sorties: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['validate', 'cancel', 'remove'])

function fullName(item) {
  return [item.nom, item.postnom, item.prenom].filter(Boolean).join(' ') || '—'
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
              Type
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Motif
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
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des sorties...
            </td>
          </tr>

          <tr v-else-if="sorties.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucune sortie trouvée.
            </td>
          </tr>

          <tr v-for="item in sorties" v-else :key="item.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(item) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Patient N° {{ item.numero_patient }} · Fiche {{ item.numero_fiche }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.type_sortie }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.motif_sortie || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.date_sortie || '—' }}
            </td>

            <td class="px-4 py-4">
              <SortieStatusBadge :statut="item.statut" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/sorties/${item.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>

                <RouterLink :to="`/sorties/${item.id}/edit`">
                  <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
                </RouterLink>

                <BaseButton
                  v-if="item.statut !== 'validated'"
                  variant="success"
                  size="sm"
                  @click="$emit('validate', item)"
                >
                  Valider
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
