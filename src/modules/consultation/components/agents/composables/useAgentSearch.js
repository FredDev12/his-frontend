// components/agents/composables/useAgentSearch.js
import { ref, watch, computed } from "vue"
import { 
  searchAgents, 
  searchAgentsByField,
  getAgentsBySite,
  getAgentsByFunction,
  getAgentByCAC 
} from "../../../../../api/agents.api"
import { useToastStore } from "../../../../../stores/toast.store"
import { SEARCH_TYPES, PAGE_SIZE_OPTIONS, PLACEHOLDERS } from "../constants/searchTypes"
import { useAgentPagination } from "./useAgentPagination"
import { useAgentFilters } from "./useAgentFilters"
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

  // Composables
  const { 
    pagination, 
    updatePagination, 
    resetPagination,
    visiblePages 
  } = useAgentPagination()

  const { 
    localFilter, 
    filteredAgents, 
    filterActive,
    resetLocalFilter,
    normalize 
  } = useAgentFilters(agents)

  // Validation de la recherche
  const isValidSearch = computed(() => {
    if (searchType.value === "multi") {
      return Object.values(advancedFilters.value).some(v => v.trim().length >= 2)
    }
    return query.value.trim().length >= 2
  })

  // Debounced search
  const debouncedSearch = debounce(() => {
    search()
  }, 400)

  // Recherche principale
  const search = async (resetPage = true) => {
    if (!isValidSearch.value) {
      agents.value = []
      hasSearched.value = true
      return toast.add("Veuillez saisir au moins 2 caractères", "info")
    }

    if (resetPage) {
      pagination.value.page = 1
    }

    searching.value = true
    hasSearched.value = true
    resetLocalFilter()

    try {
      let res = null
      
      switch (searchType.value) {
        case "multi":
          res = await searchMulti()
          break
        case "nom":
          res = await searchByNom()
          break
        case "cac":
          res = await searchByCac()
          break
        case "site":
          res = await searchBySite()
          break
        case "fonction":
          res = await searchByFonction()
          break
      }
      
      handleSearchResponse(res)
    } catch (err) {
      handleSearchError(err)
    } finally {
      searching.value = false
    }
  }

  // Méthodes de recherche par type
  const searchMulti = async () => {
    const params = {}
    Object.entries(advancedFilters.value).forEach(([key, value]) => {
      if (value.trim()) params[key] = normalize(value)
    })
    const res = await searchAgents(params)
    agents.value = res?.data?.data || []
    updatePagination(res?.data?.pagination)
    return res
  }

  const searchByNom = async () => {
    const res = await searchAgentsByField(
      "nom_post", 
      normalize(query.value),
      pagination.value.page,
      pagination.value.limit
    )
    agents.value = res?.data?.data || []
    updatePagination(res?.data?.pagination)
    return res
  }

  const searchByCac = async () => {
    try {
      const res = await getAgentByCAC(normalize(query.value))
      agents.value = res?.data?.data ? [res.data.data] : []
      pagination.value = {
        page: 1,
        limit: 1,
        total: agents.value.length,
        pages: 1,
        hasNext: false,
        hasPrev: false
      }
      return res
    } catch (err) {
      agents.value = []
      resetPagination()
      throw err
    }
  }

  const searchBySite = async () => {
    const res = await getAgentsBySite(
      normalize(query.value),
      pagination.value.page,
      pagination.value.limit
    )
    agents.value = res?.data?.data || []
    updatePagination(res?.data?.pagination)
    return res
  }

  const searchByFonction = async () => {
    const res = await getAgentsByFunction(
      normalize(query.value),
      pagination.value.page,
      pagination.value.limit
    )
    agents.value = res?.data?.data || []
    updatePagination(res?.data?.pagination)
    return res
  }

  // Gestion des réponses/erreurs
  const handleSearchResponse = (res) => {
    if (agents.value.length > 0) {
      const message = pagination.value.total > agents.value.length
        ? `${agents.value.length} agent(s) affiché(s) sur ${pagination.value.total} total`
        : `${agents.value.length} agent(s) trouvé(s)`
      toast.add(message, "success")
    } else {
      toast.add("Aucun agent trouvé", "info")
    }
  }

  const handleSearchError = (err) => {
    console.error("Erreur recherche:", err)
    agents.value = []
    resetPagination()
    toast.add("Erreur lors de la recherche", "error")
  }

  // Navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.value.pages) {
      pagination.value.page = page
      search(false)
    }
  }

  const changePageSize = () => {
    pagination.value.page = 1
    search(false)
  }

  // Sélection d'un agent
  const pick = (agent) => {
    selectedCacId.value = agent.cac_id_co
    emit("selectAgent", agent)
    resetAll()
  }

  // Réinitialisations
  const resetFilters = () => {
    advancedFilters.value = {
      cac_id_co: "",
      nom_post: "",
      prenom: "",
      site: "",
      telephone: "",
      fonction: ""
    }
    query.value = ""
    resetLocalFilter()
    resetPagination()
  }

  const resetAll = () => {
    query.value = ""
    resetLocalFilter()
    advancedFilters.value = {
      cac_id_co: "",
      nom_post: "",
      prenom: "",
      site: "",
      telephone: "",
      fonction: ""
    }
    agents.value = []
    resetPagination()
  }

  // Watchers
  watch(searchType, () => {
    resetPagination()
    agents.value = []
    hasSearched.value = false
    query.value = ""
    resetLocalFilter()
  })

  // Placeholder
  const getPlaceholder = () => {
    const type = searchType.value
    return PLACEHOLDERS[type] || PLACEHOLDERS.default
  }

  return {
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
    resetAll,
    isValidSearch,
    getPlaceholder,
    SEARCH_TYPES,
    PAGE_SIZE_OPTIONS
  }
}