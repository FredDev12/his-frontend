<!-- components/agents/components/AgentSearchHeader.vue -->
<script setup>
import { SEARCH_TYPES } from "../constants/searchTypes"

defineProps({
  searchType: {
    type: String,
    required: true
  }
})

defineEmits(['update:searchType'])
</script>

<template>
  <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-gray-800 flex items-center gap-2">
          <span class="text-blue-600">🔍</span>
          Recherche d'agent CAC
        </h3>
        <p class="text-xs text-gray-600 mt-1">
          Recherchez un agent par différents critères
        </p>
      </div>
      
      <!-- Sélecteur de type de recherche -->
      <div class="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
        <button
          v-for="type in SEARCH_TYPES"
          :key="type.value"
          @click="$emit('update:searchType', type.value)"
          class="px-3 py-1.5 text-sm rounded-md transition flex items-center gap-1"
          :class="[
            searchType === type.value
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          <span>{{ type.icon }}</span>
          <span class="hidden sm:inline">{{ type.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>