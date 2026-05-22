<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import AgentSearchBar from '@/modules/agents/components/AgentSearchBar.vue'
import AgentTable from '@/modules/agents/components/AgentTable.vue'

import { useAgentsStore } from '@/modules/agents/stores/agents.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useAgentsStore()
const toast = useToastStore()

const totalLabel = computed(() => {
  if (!store.pagination.total) return `${store.agents.length} agent(s)`
  return `${store.pagination.total} agent(s)`
})

const hasActiveSearch = computed(() =>
  Object.values(store.filters).some((value) => String(value || '').trim()),
)

onMounted(() => {
  loadAgents({ page: 1 })
})

async function loadAgents(params = {}) {
  try {
    await store.fetchAgents({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Agents CAC] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les agents CAC.')
  }
}

async function goToPage(page) {
  await loadAgents({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchAgents(filters)
  } catch (error) {
    console.error('[Agents CAC] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche agent CAC impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    cac_id_co: '',
    nom_post: '',
    prenom: '',
    site: '',
    telephone: '',
    fonction: '',
  }

  await loadAgents({ page: 1 })
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Agents CAC</h1>

        <p class="his-page-subtitle">
          Consultation des agents CAC, recherche avancée et accès aux détails.
        </p>
      </div>

      <RouterLink to="/agents/statistiques">
        <BaseButton variant="secondary"> Statistiques </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <AgentSearchBar
        :filters="store.filters"
        :loading="store.searching"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <AgentTable :agents="store.agents" :loading="store.loading" />

      <div
        v-if="!store.loading && hasActiveSearch && store.agents.length === 0"
        class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5"
      >
        <p class="font-semibold text-amber-900">Aucun agent CAC trouvé</p>

        <p class="mt-1 text-sm text-amber-800">
          Si la personne n’est pas confirmée comme agent CAC ou bénéficiaire, elle doit être
          enregistrée comme patient public. Les frais normaux s’appliquent.
        </p>

        <div class="mt-4">
          <RouterLink to="/patients/create?source=public">
            <BaseButton variant="secondary"> Créer patient public </BaseButton>
          </RouterLink>
        </div>
      </div>

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || store.pagination.page <= 1"
            @click="goToPage(store.pagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasNext"
            @click="goToPage(store.pagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
