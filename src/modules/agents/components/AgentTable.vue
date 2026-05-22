<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

defineProps({
  agents: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

function fullName(agent) {
  return [agent.nom_post, agent.prenom].filter(Boolean).join(' ') || '—'
}

function detailTarget(agent) {
  return agent.id || agent.cac_id_co
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
              Agent
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Fonction
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Site
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Téléphone
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Sexe
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
              Chargement des agents CAC...
            </td>
          </tr>

          <tr v-else-if="agents.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun agent CAC trouvé.
            </td>
          </tr>

          <tr
            v-for="agent in agents"
            v-else
            :key="agent.id || agent.cac_id_co"
            class="hover:bg-slate-50"
          >
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(agent) }}
              </p>

              <p class="mt-1 text-xs text-slate-500">CAC ID : {{ agent.cac_id_co || '—' }}</p>
            </td>

            <td class="px-4 py-4">
              <BaseBadge variant="primary">
                {{ agent.fonction || '—' }}
              </BaseBadge>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ agent.site || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ agent.telephone || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ agent.sexe || '—' }}
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/agents/${detailTarget(agent)}`">
                  <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
                </RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        Chargement des agents CAC...
      </div>

      <div
        v-else-if="agents.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucun agent CAC trouvé.
      </div>

      <article
        v-for="agent in agents"
        v-else
        :key="agent.id || agent.cac_id_co"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ fullName(agent) }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">CAC ID : {{ agent.cac_id_co || '—' }}</p>
          </div>

          <BaseBadge variant="primary">
            {{ agent.fonction || '—' }}
          </BaseBadge>
        </div>

        <div class="mt-4 space-y-1 text-sm text-slate-600">
          <p>Site : {{ agent.site || '—' }}</p>
          <p>Téléphone : {{ agent.telephone || '—' }}</p>
        </div>

        <div class="mt-4">
          <RouterLink :to="`/agents/${detailTarget(agent)}`">
            <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>
