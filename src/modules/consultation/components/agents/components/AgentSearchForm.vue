<!-- components/agents/components/AgentSearchForm.vue -->
<script setup>
import { SEARCH_TYPES } from "../constants/searchTypes"
import BaseInput from "../../../../../components/ui/BaseInput.vue"
import BaseButton from "../../../../../components/ui/BaseButton.vue"

const props = defineProps({
  searchType: {
    type: String,
    required: true
  },
  query: {
    type: String,
    default: ""
  },
  advancedFilters: {
    type: Object,
    required: true
  },
  showAdvanced: {
    type: Boolean,
    default: false
  },
  searching: {
    type: Boolean,
    default: false
  },
  isValidSearch: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "Saisissez une valeur..."
  }
})

const emit = defineEmits([
  'update:query',
  'update:advancedFilters',
  'update:showAdvanced',
  'search',
  'reset'
])

const updateFilter = (key, value) => {
  emit('update:advancedFilters', {
    ...props.advancedFilters,
    [key]: value
  })
}
</script>

<template>
  <div class="p-6">
    <!-- Recherche simple -->
    <div v-if="searchType !== 'multi'" class="flex flex-col sm:flex-row items-end gap-4">
      <div class="flex-1 w-full">
        <label class="text-sm font-medium text-gray-600 mb-1.5 block">
          {{ SEARCH_TYPES.find(t => t.value === searchType)?.label }}
        </label>
        <BaseInput
          :model-value="query"
          @update:model-value="$emit('update:query', $event)"
          :placeholder="placeholder"
          class="w-full"
          @keyup.enter="$emit('search')"
        />
      </div>

      <div class="flex gap-2 w-full sm:w-auto">
        <BaseButton 
          variant="primary" 
          @click="$emit('search')" 
          :loading="searching"
          :disabled="!isValidSearch"
          class="flex-1 sm:flex-none"
        >
          <span class="flex items-center gap-2">
            <span>🔍</span>
            {{ searching ? "Recherche..." : "Rechercher" }}
          </span>
        </BaseButton>
        
        <BaseButton 
          v-if="query"
          variant="secondary" 
          @click="$emit('update:query', '')"
          class="px-3"
        >
          ✕
        </BaseButton>
      </div>
    </div>

    <!-- Recherche avancée -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-600">
          Filtres de recherche avancée
        </label>
        <button 
          @click="$emit('update:showAdvanced', !showAdvanced)"
          class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>{{ showAdvanced ? '▼' : '▶' }}</span>
          {{ showAdvanced ? 'Masquer' : 'Afficher' }} les filtres
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput
          :model-value="advancedFilters.nom_post"
          @update:model-value="updateFilter('nom_post', $event)"
          label="Nom"
          placeholder="Ex: MONTEIRO"
        />
        <BaseInput
          :model-value="advancedFilters.prenom"
          @update:model-value="updateFilter('prenom', $event)"
          label="Prénom"
          placeholder="Ex: Jean"
        />
      </div>

      <div v-if="showAdvanced" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <BaseInput
          :model-value="advancedFilters.cac_id_co"
          @update:model-value="updateFilter('cac_id_co', $event)"
          label="CAC ID"
          placeholder="Ex: CAC001234"
        />
        <BaseInput
          :model-value="advancedFilters.site"
          @update:model-value="updateFilter('site', $event)"
          label="Site"
          placeholder="Ex: KINSHASA"
        />
        <BaseInput
          :model-value="advancedFilters.fonction"
          @update:model-value="updateFilter('fonction', $event)"
          label="Fonction"
          placeholder="Ex: MEDECIN"
        />
        <BaseInput
          :model-value="advancedFilters.telephone"
          @update:model-value="updateFilter('telephone', $event)"
          label="Téléphone"
          placeholder="Ex: 243812345678"
        />
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <BaseButton 
          variant="primary" 
          @click="$emit('search')" 
          :loading="searching"
          :disabled="!isValidSearch"
        >
          <span class="flex items-center gap-2">
            <span>🔍</span>
            {{ searching ? "Recherche en cours..." : "Lancer la recherche" }}
          </span>
        </BaseButton>
        
        <BaseButton 
          variant="secondary" 
          @click="$emit('reset')"
          :disabled="!Object.values(advancedFilters).some(v => v)"
        >
          Réinitialiser
        </BaseButton>
      </div>
    </div>

    <!-- Indicateur de recherche -->
    <div v-if="searching" class="mt-4 flex items-center gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
      <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      Recherche en cours...
    </div>
  </div>
</template>