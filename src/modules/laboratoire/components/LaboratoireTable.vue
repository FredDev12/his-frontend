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

function fullName(item) {
  return [item.nom, item.postnom, item.prenom]
    .filter(Boolean)
    .join(' ') || '—'
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
              Examen
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Indication
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
            <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des examens...
            </td>
          </tr>

          <tr v-else-if="examens.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun examen de laboratoire dans votre périmètre.
            </td>
          </tr>

          <tr
            v-for="item in examens"
            v-else
            :key="item.id"
            class="hover:bg-slate-50"
          >
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(item) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ item.numero_patient }} · {{ item.episode_code }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-700">
              <p class="font-medium text-slate-900">
                {{ item.examen_principal }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ item.examen_code }}
              </p>
            </td>

            <td class="max-w-xs px-4 py-4 text-sm text-slate-600">
              {{ item.indication_clinique || '—' }}
            </td>

            <td class="px-4 py-4">
              <LaboratoireStatusBadge :statut="item.statut" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end">
                <RouterLink :to="`/laboratoire/${item.id}`">
                  <BaseButton variant="secondary" size="sm">
                    Voir / traiter
                  </BaseButton>
                </RouterLink>
              </div>
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
        Chargement des examens...
      </div>

      <div
        v-else-if="examens.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucun examen de laboratoire dans votre périmètre.
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
          {{ item.numero_patient }} · {{ item.episode_code }}
        </p>

        <div class="mt-4">
          <RouterLink :to="`/laboratoire/${item.id}`">
            <BaseButton variant="secondary" size="sm">
              Voir / traiter
            </BaseButton>
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>
