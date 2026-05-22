<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import FactureStatusBadge from '@/modules/facturation/components/FactureStatusBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  factures: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['issue', 'paid', 'cancel', 'remove'])

function fullName(facture) {
  return [facture.nom, facture.postnom, facture.prenom].filter(Boolean).join(' ') || '—'
}

function formatMoney(facture) {
  return `${Number(facture.total || 0).toLocaleString('fr-FR')} ${facture.devise || 'CDF'}`
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
              Facture
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Patient
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Total
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Statut
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Date
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
              Chargement des factures...
            </td>
          </tr>

          <tr v-else-if="factures.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucune facture trouvée.
            </td>
          </tr>

          <tr v-for="facture in factures" v-else :key="facture.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">{{ facture.numero }}</p>
              <p class="mt-1 text-xs text-slate-500">ID : {{ facture.id }}</p>
            </td>

            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">{{ fullName(facture) }}</p>
              <p class="mt-1 text-xs text-slate-500">
                Patient N° {{ facture.numero_patient }} · Fiche {{ facture.numero_fiche }}
              </p>
            </td>

            <td class="px-4 py-4 font-semibold text-slate-950">
              {{ formatMoney(facture) }}
            </td>

            <td class="px-4 py-4">
              <FactureStatusBadge :statut="facture.statut" />
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ formatDateTime(facture.created_at) }}
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/facturation/${facture.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>

                <RouterLink
                  v-if="facture.statut === 'draft'"
                  :to="`/facturation/${facture.id}/edit`"
                >
                  <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
                </RouterLink>

                <BaseButton
                  v-if="facture.statut === 'draft'"
                  variant="primary"
                  size="sm"
                  @click="$emit('issue', facture)"
                >
                  Émettre
                </BaseButton>

                <BaseButton
                  v-if="facture.statut === 'issued'"
                  variant="success"
                  size="sm"
                  @click="$emit('paid', facture)"
                >
                  Payée
                </BaseButton>

                <BaseButton
                  v-if="!['paid', 'cancelled'].includes(facture.statut)"
                  variant="warning"
                  size="sm"
                  @click="$emit('cancel', facture)"
                >
                  Annuler
                </BaseButton>

                <BaseButton variant="danger" size="sm" @click="$emit('remove', facture)">
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
