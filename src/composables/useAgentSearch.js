// src/composables/useAgentSearch.js
import { ref, watch, computed } from "vue"
import {
  searchAgents,
  searchAgentsByField,
  getAgentsBySite,
  getAgentsByFunction,
  getAgentByCAC
} from "../api/agents.api"
import { useToastStore } from "../stores/toast.store"
import { debounce } from "lodash"

export function useAgentSearch(emit) {
  const toast = useToastStore()

  // États
  const searchType = ref("multi")
  const query = ref("")
  const agents = ref([])
  const selectedCacId = ref(null)
  const advancedFilters = ref({
    cac_id_co: "",
    nom_post: "",
    prenom: "",
    site: "",
    telephone: "",
    fonction: ""
  })
  const searching = ref(false)
  const hasSearched = ref(false)
  const showAdvanced = ref(false)

  // Pagination basique
  const pagination = ref({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0
  })

  // Filtres locaux
  const localFilter = ref("")

  // Computed
  const filteredAgents = computed(() => {
    if (!localFilter.value) return agents.value

    const filter = localFilter.value.toLowerCase()
    return agents.value.filter(agent =>
      agent.nom_post?.toLowerCase().includes(filter) ||
      agent.prenom?.toLowerCase().includes(filter) ||
      agent.cac_id_co?.toLowerCase().includes(filter) ||
      agent.site?.toLowerCase().includes(filter) ||
      agent.fonction?.toLowerCase().includes(filter)
    )
  })

  const visiblePages = computed(() => {
    const current = pagination.value.page
    const total = pagination.value.totalPages
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total)
    } else if (total > 1) {
      rangeWithDots.push(total)
    }

    return rangeWithDots
  })

  // Methods
  const updatePagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const resetPagination = () => {
    pagination.value = {
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 0
    }
  }

  const resetLocalFilter = () => {
    localFilter.value = ""
  }

  const normalize = (str) => {
    return str ? str.toString().toLowerCase().trim() : ""
  }

  const performSearch = async (searchParams = {}) => {
    searching.value = true
    try {
      let results = []

      if (searchType.value === "cac") {
        if (query.value) {
          const response = await getAgentByCAC(query.value)
          results = response.data ? [response.data] : []
        }
      } else if (searchType.value === "site") {
        const response = await getAgentsBySite({
          ...pagination.value,
          ...searchParams
        })
        results = response.data.data || []
        updatePagination({
          total: response.data.total || 0,
          totalPages: response.data.last_page || 0
        })
      } else if (searchType.value === "fonction") {
        const response = await getAgentsByFunction({
          ...pagination.value,
          ...searchParams
        })
        results = response.data.data || []
        updatePagination({
          total: response.data.total || 0,
          totalPages: response.data.last_page || 0
        })
      } else {
        // Recherche multi-critères
        const response = await searchAgents({
          q: query.value,
          ...pagination.value,
          ...searchParams
        })
        results = response.data.data || []
        updatePagination({
          total: response.data.total || 0,
          totalPages: response.data.last_page || 0
        })
      }

      agents.value = results
      hasSearched.value = true

      if (emit) {
        emit('search-results', results)
      }

    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      toast.add({
        type: 'error',
        message: 'Erreur lors de la recherche d\'agents'
      })
      agents.value = []
    } finally {
      searching.value = false
    }
  }

  const debouncedSearch = debounce(performSearch, 300)

  const selectAgent = (agent) => {
    selectedCacId.value = agent.cac_id_co
    if (emit) {
      emit('agent-selected', agent)
    }
  }

  const clearSearch = () => {
    query.value = ""
    agents.value = []
    selectedCacId.value = null
    hasSearched.value = false
    resetPagination()
    resetLocalFilter()
  }

  const toggleAdvanced = () => {
    showAdvanced.value = !showAdvanced.value
  }

  // Watchers
  watch(query, (newQuery) => {
    if (newQuery && searchType.value !== "cac") {
      debouncedSearch()
    }
  })

  watch(searchType, () => {
    clearSearch()
  })

  return {
    // State
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

    // Computed
    filteredAgents,
    visiblePages,

    // Methods
    performSearch,
    debouncedSearch,
    selectAgent,
    clearSearch,
    toggleAdvanced,
    updatePagination,
    resetPagination,
    resetLocalFilter,
    normalize
  }
}