<!-- components/agents/components/AgentSearchResults.vue -->
<script setup>
import { computed } from "vue"
import { PAGE_SIZE_OPTIONS } from "../constants/searchTypes"
import BaseInput from "../../../../../components/ui/BaseInput.vue"
import AgentCard from "./AgentCard.vue"

const props = defineProps({
  agents: {
    type: Array,
    required: true
  },
  filteredAgents: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  selectedCacId: {
    type: String,
    default: null
  },
  localFilter: {
    type: String,
    default: ""
  },
  filterActive: {
    type: Boolean,
    default: false
  },
  visiblePages: {
    type: Array,
    default: () => []
  },
  searchType: {
    type: String,
    required: true
  },
  hasSearched: {
    type: Boolean,
    default: false
  },
  searching: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:localFilter',
  'select',
  'page-change',
  'page-size-change'
])

const showFilterBar = computed(() => {
  return props.agents.length > 0 && 
         (props.searchType === 'site' || props.searchType === 'fonction')
})
</script>

<template>
  <div v-if="agents.length > 0" class="border-t border-gray-100">
    <!-- Barre de filtrage -->
    <div v-if="showFilterBar" class="px-6 py-3 bg-gray-50 border-y border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex-1 w-full">
          <div class="relative">
            <BaseInput
              :model-value="localFilter"
              @update:model-value="$emit('update:localFilter', $event)"
              placeholder="Filtrer par nom d'agent..."
              class="w-full"
            >
              <template #prefix>
                <span class="text-gray-400">🔍</span>
              </template>
            </BaseInput>
          </div>
        </div>
        
        <div class="text-sm text-gray-600 whitespace-nowrap">
          <span class="font-medium">{{ filteredAgents.length }}</span>
          <span class="text-gray-400"> / {{ agents.length }}</span>
          <span v-if="filterActive" class="ml-2 text-blue-600 text-xs">
            (filtré)
          </span>
        </div>
      </div>
    </div>

    <!-- En-tête des résultats -->
    <div class="px-6 py-3 bg-gray-50 border-b border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <!-- Compteur -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">
            {{ filteredAgents.length }} résultat(s) affiché(s)
          </span>
          <span v-if="filteredAgents.length !== agents.length" class="text-xs text-gray-500">
            (sur {{ agents.length }} dans cette page)
          </span>
          <span v-if="pagination.total > agents.length" class="text-xs text-blue-600">
            total : {{ pagination.total }} agent(s)
          </span>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 hidden sm:inline">Afficher:</span>
            <select 
              :value="pagination.limit"
              @change="$emit('page-size-change', parseInt($event.target.value))"
              class="text-sm border rounded-md px-2 py-1.5 bg-white"
            >
              <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center gap-1">
            <button
              @click="$emit('page-change', 1)"
              :disabled="!pagination.hasPrev"
              class="w-8 h-8 flex items-center justify-center rounded-md border disabled:opacity-50 hover:bg-gray-50"
              title="Première page"
            >
              ⏮
            </button>
            <button
              @click="$emit('page-change', pagination.page - 1)"
              :disabled="!pagination.hasPrev"
              class="w-8 h-8 flex items-center justify-center rounded-md border disabled:opacity-50 hover:bg-gray-50"
              title="Page précédente"
            >
              ←
            </button>
            
            <div class="px-3 py-1.5 text-sm bg-white border rounded-md">
              <span class="font-medium">{{ pagination.page }}</span>
              <span class="text-gray-500"> / {{ pagination.pages }}</span>
            </div>
            
            <button
              @click="$emit('page-change', pagination.page + 1)"
              :disabled="!pagination.hasNext"
              class="w-8 h-8 flex items-center justify-center rounded-md border disabled:opacity-50 hover:bg-gray-50"
              title="Page suivante"
            >
              →
            </button>
            <button
              @click="$emit('page-change', pagination.pages)"
              :disabled="!pagination.hasNext"
              class="w-8 h-8 flex items-center justify-center rounded-md border disabled:opacity-50 hover:bg-gray-50"
              title="Dernière page"
            >
              ⏭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des agents -->
    <div class="p-6 max-h-96 overflow-y-auto custom-scroll space-y-3">
      <AgentCard
        v-for="agent in filteredAgents"
        :key="agent.cac_id_co"
        :agent="agent"
        :is-selected="selectedCacId === agent.cac_id_co"
        :local-filter="localFilter"
        :filter-active="filterActive"
        @select="$emit('select', $event)"
      />
    </div>

    <!-- Pagination basse -->
    <div v-if="pagination.pages > 5" class="px-6 py-3 border-t border-gray-100 bg-gray-50">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">
          Page {{ pagination.page }} sur {{ pagination.pages }}
        </span>
        
        <div class="flex gap-1">
          <button
            v-for="pageNum in visiblePages"
            :key="pageNum"
            @click="pageNum !== '...' && $emit('page-change', pageNum)"
            class="w-8 h-8 text-sm rounded-md border"
            :class="[
              pagination.page === pageNum 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white hover:bg-gray-50'
            ]"
          >
            {{ pageNum }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- États vides -->
  <div 
    v-else-if="hasSearched && !searching" 
    class="p-12 text-center border-t border-gray-100"
  >
    <div class="text-5xl mb-4 opacity-30">👤</div>
    <p class="text-gray-500 font-medium">Aucun agent trouvé</p>
    <p class="text-sm text-gray-400 mt-1">
      Essayez avec d'autres critères de recherche
    </p>
  </div>

  <div 
    v-else-if="!hasSearched && !searching" 
    class="p-12 text-center border-t border-gray-100"
  >
    <div class="text-5xl mb-4 opacity-30">🔍</div>
    <p class="text-gray-500 font-medium">Recherchez un agent</p>
    <p class="text-sm text-gray-400 mt-1">
      Utilisez les différents modes de recherche ci-dessus
    </p>
  </div>
</template>

<style scoped>
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 20px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 20px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>