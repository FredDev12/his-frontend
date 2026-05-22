<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import AgentStatsCards from '@/modules/agents/components/AgentStatsCards.vue'

import { useAgentsStore } from '@/modules/agents/stores/agents.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useAgentsStore()
const toast = useToastStore()

onMounted(async () => {
  try {
    await store.fetchStats()
  } catch (error) {
    console.error('[Agents CAC] Statistiques impossibles:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les statistiques agents.')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Statistiques agents CAC</h1>

        <p class="his-page-subtitle">Répartition des agents par site, fonction, sexe et statut.</p>
      </div>

      <RouterLink to="/agents">
        <BaseButton variant="secondary"> Retour </BaseButton>
      </RouterLink>
    </header>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <AgentStatsCards :stats="store.stats" :loading="store.loadingStats" />
  </div>
</template>
