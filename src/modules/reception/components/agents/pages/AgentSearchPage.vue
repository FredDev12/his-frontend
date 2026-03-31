<template>
  <div class="p-2 max-w-10xl mx-auto">
    <div class="mb-4">
      <button
        @click="goBack"
        class="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-100 transition"
        >
        ← Retour
      </button>
    </div>

    <h1 class="text-3xl font-bold text-gray-800 mb-6">Recherche d'agents</h1>

    <!-- Barre de recherche -->
    <div class="mb-6">
      <AgentSearchBar 
        v-model="query" 
        @search="onSearch" 
        @update:searchType="searchType = $event" 
      />
    </div>

    <!-- DEBUG / Info -->
    <div class="bg-gray-100 p-4 rounded mt-4 text-xs" v-if="true">
      <h3 class="font-bold">DEBUG</h3>
      <p>Query: "{{ query }}"</p>
      <p>Type recherche: "{{ searchType }}"</p>
      <p>Résultats trouvés: {{ searchResults.length }}</p>
      <p>Total: {{ searchPagination.total }}</p>
      <p>Page: {{ searchPagination.page }} / {{ totalPages }}</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading || agentStore.loading" class="text-center py-6 text-gray-500">
      Chargement...
    </div>

    <!-- Error -->
    <div v-if="error || agentStore.error" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
      {{ error || agentStore.error }}
    </div>

    <!-- 🔍 Filtre local sur les 100 résultats -->
    <div v-if="showLocalSearch" class="mb-4">
      <input
        v-model="localFilter"
        placeholder="Filtrer dans les 100 résultats..."
        class="w-full px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-green-500"
      />
    </div>

    <template v-if="filteredResults.length > 2">
      <AgentList :agents="filteredResults" :type="searchType" @select="selectAgent" />
    </template>

    <template v-else-if="filteredResults.length === 1">
      <AgentCard :agent="filteredResults[0]" @select="selectAgent"/>
    </template>

    <template v-else-if="filteredResults.length === 2">
      <AgentCard :agent="filteredResults" @select="selectAgent"/>
    </template>

    <div v-else-if="!isLoading" class="text-center py-8 text-gray-500">
      Aucun résultat trouvé
    </div>

    <!-- Pagination -->
    <div v-if="query && searchPagination.total > searchPagination.limit" 
         class="mt-6 flex justify-center space-x-2">
      <button
        @click="previousPage"
        :disabled="!searchPagination.hasPrev || isLoading"
        class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Précédent
      </button>
      <span class="px-4 py-2 text-gray-700">
        Page {{ searchPagination.page }} / {{ totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="!searchPagination.hasNext || isLoading"
        class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Suivant
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAgentStore } from "../stores/agents.store"
import AgentSearchBar from "../components/AgentSearchBar.vue"
import AgentList from "../components/AgentList.vue"
import { useSmartSearch } from "../composables/useSmartSearch"
import AgentCard from "../components/AgentCard.vue"

const query = ref("")
const searchType = ref("global")
const agentStore = useAgentStore()
const smartSearch = useSmartSearch()
const router = useRouter()
const route = useRoute()
const localFilter = ref("")

const emit = defineEmits(["back"])

function goBack() {
  emit("back")
}

const filteredResults = computed(() => {
  if (!localFilter.value.trim()) return searchResults.value

  const keyword = localFilter.value.toLowerCase()

  return searchResults.value.filter(agent => {
    return Object.values(agent).some(val =>
      String(val).toLowerCase().includes(keyword)
    )
  })
})

const showLocalSearch = computed(() => {
  return (
    searchResults.value.length >= 100 &&
    (searchType.value === "site" || searchType.value === "fonction")
  )
})

const searchResults = ref([])
const searchPagination = ref({
  page: 1,
  limit: 100,
  total: 0,
  hasNext: false,
  hasPrev: false
})
const isLoading = ref(false)
const error = ref(null)

const resetSearch = () => {
  query.value = ""
  searchResults.value = []
  searchPagination.value = {
    page: 1,
    limit: 100,
    total: 0,
    hasNext: false,
    hasPrev: false
  }
  error.value = null
}

// 🔹 Fonction de recherche avec gestion des types
const onSearch = async ({payload, type}) => {
  if (!payload || (typeof payload === "string" && !payload.trim())) {
    resetSearch()
    return
  }

  isLoading.value = true
  error.value = null
  searchType.value = type
  localFilter.value = ""

  console.log("recherche :",payload, "type de recherche", type);
  

  try {
    const results = await smartSearch.search(
        payload, 
        { page: 1, limit: 100 }, 
        type
    )

    console.log("result recherche : ", results);
    
    //console.log("result recherche : ", results.data);
    
    if (!results) return

    if (results.data && Array.isArray(results.data)) {
      searchResults.value = results.data
      searchPagination.value = {
        page: results.pagination?.page || 1,
        limit: results.pagination?.limit || 100,
        total: results.pagination?.total || results.data.length,
        hasNext: results.pagination?.hasNext || false,
        hasPrev: results.pagination?.hasPrev || false
      }
    } else if (results.data && typeof results.data === "object") {
      searchResults.value = [results.data]
      searchPagination.value = { 
        page:1, 
        limit:100, 
        total:1, 
        hasNext:false, 
        hasPrev:false }
    } else if (Array.isArray(results) ) {
      searchResults.value = results
      searchPagination.value = { 
        page:1, 
        limit:100, 
        total:results.length, 
        hasNext:false, 
        hasPrev:false }
    }else  {
      searchResults.value = []
      searchPagination.value = { 
        page:1, 
        limit:100, 
        total:0, 
        hasNext:false, 
        hasPrev:false }
    }
    
    console.log("result recherche ss : ", searchResults.value);
    

  } catch (err) {
    error.value = "Erreur lors de la recherche"
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const selectAgent = (agent) => {
  router.push(`/agents/${agent.cac_id_co}`)
}

// Pagination
const totalPages = computed(() => {
  if (searchPagination.value.total === 0) return 0
  return Math.ceil(searchPagination.value.total / searchPagination.value.limit)
})

// nextPage & previousPage restent identiques (utilisent query.value)

watch(() => route.query.reset, val => {
  if (val === "true") {
    resetSearch()
    router.replace({ path: route.path, query: {} })
  }
})

onMounted(() => {
  agentStore.fetchAgentStats()
  resetSearch()
})
</script>