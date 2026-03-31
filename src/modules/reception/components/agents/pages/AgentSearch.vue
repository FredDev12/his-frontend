<!-- components/agents/AgentSearch.vue -->
<script setup>
import { useAgentSearch } from "../composables/useAgentSearch"
import AgentSearchHeader from "./components/AgentSearchHeader.vue"
import AgentSearchForm from "./components/AgentSearchForm.vue"
import AgentSearchResults from "./components/AgentSearchResults.vue"

const emit = defineEmits(["selectAgent"])

const {
  // États
  searchType,
  query,
  agents,
  selectedCacId,
  advancedFilters,
  searching,
  hasSearched,
  showAdvanced,
  pagination,
  localFilter,
  filteredAgents,
  filterActive,
  visiblePages,
  
  // Méthodes
  search,
  debouncedSearch,
  goToPage,
  changePageSize,
  pick,
  resetFilters,
  isValidSearch,
  getPlaceholder,
  SEARCH_TYPES,
  PAGE_SIZE_OPTIONS
} = useAgentSearch(emit)
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <AgentSearchHeader 
      :search-type="searchType"
      @update:search-type="searchType = $event"
    />

    <AgentSearchForm
      :search-type="searchType"
      :query="query"
      :advanced-filters="advancedFilters"
      :show-advanced="showAdvanced"
      :searching="searching"
      :is-valid-search="isValidSearch"
      :placeholder="getPlaceholder()"
      @update:query="query = $event; debouncedSearch()"
      @update:advanced-filters="advancedFilters = $event"
      @update:show-advanced="showAdvanced = $event"
      @search="search"
      @reset="resetFilters"
    />

    <AgentSearchResults
      :agents="agents"
      :filtered-agents="filteredAgents"
      :pagination="pagination"
      :selected-cac-id="selectedCacId"
      :local-filter="localFilter"
      :filter-active="filterActive"
      :visible-pages="visiblePages"
      :search-type="searchType"
      :has-searched="hasSearched"
      :searching="searching"
      @update:local-filter="localFilter = $event"
      @select="pick"
      @page-change="goToPage"
      @page-size-change="changePageSize"
    />
  </div>
</template>