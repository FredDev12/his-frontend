<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import LaboratoireStatusBadge from '@/modules/laboratoire/components/LaboratoireStatusBadge.vue'

defineProps({
  examens: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['remove'])

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
              Examen
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Date
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Résultat
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
              Chargement des examens...
            </td>
          </tr>

          <tr v-else-if="examens.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun examen laboratoire trouvé.
            </td>
          </tr>

          <tr v-for="item in examens" v-else :key="item.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(item) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Patient N° {{ item.numero_patient }} · Fiche {{ item.numero_fiche }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.examen_principal }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.date || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ item.resultat || '—' }}
            </td>

            <td class="px-4 py-4">
              <LaboratoireStatusBadge :statut="item.statut" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/laboratoire/${item.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>

                <RouterLink :to="`/laboratoire/${item.id}/edit`">
                  <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
                </RouterLink>

                <BaseButton variant="danger" size="sm" @click="$emit('remove', item)">
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
        Chargement des examens...
      </div>

      <div
        v-else-if="examens.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucun examen laboratoire trouvé.
      </div>

      <article
        v-for="item in examens"
        v-else
        :key="item.id"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ item.examen_principal }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{ fullName(item) }}
            </p>
          </div>

          <LaboratoireStatusBadge :statut="item.statut" />
        </div>

        <p class="mt-4 text-sm text-slate-600">
          Résultat :
          <span class="font-medium text-slate-900">
            {{ item.resultat || '—' }}
          </span>
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="`/laboratoire/${item.id}`">
            <BaseButton variant="secondary" size="sm">Voir</BaseButton>
          </RouterLink>

          <RouterLink :to="`/laboratoire/${item.id}/edit`">
            <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
          </RouterLink>

          <BaseButton variant="danger" size="sm" @click="$emit('remove', item)">
            Supprimer
          </BaseButton>
        </div>
      </article>
    </div>
  </div>
</template>
