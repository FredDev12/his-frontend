// src/modules/agents/stores/agents.store.js

import { defineStore } from "pinia"
import { ref, computed } from "vue"

import {
  DEFAULT_AGENT,
  DEFAULT_AGENT_STATS,
  DEFAULT_AGENTS_PAGINATED,
  DEFAULT_AGENT_SEARCH,
  DEFAULT_AGENT_SEARCH_BY_FIELD,
  DEFAULT_PAGINATION
} from "../../../agents/types/agent"

import {
  getAgents,
  getAgentStats,
  getAgentByCAC,
  getAgentsBySite,
  getAgentsByFunction,
  getAgentsByField,
  getAgentById,
  searchAgents
} from "../../../../../api/agents.api"

export const useAgentStore = defineStore("agent", () => {

  /* STATE */
  const agent = ref({ ...DEFAULT_AGENT })
  const agentList = ref({ ...DEFAULT_AGENT })
  const agentStats = ref({ ...DEFAULT_AGENT_STATS })

  const agentsPaginated = ref({ ...DEFAULT_AGENTS_PAGINATED }) // uniquement pour site/fonction
  const pagination = ref({ ...DEFAULT_PAGINATION })

  const loading = ref(false)
  const error = ref(null)

  const searchParams = ref({ ...DEFAULT_AGENT_SEARCH })
  const searchByFieldParams = ref({ ...DEFAULT_AGENT_SEARCH_BY_FIELD })

  /* GETTERS */
  const totalAgents = computed(() => agentStats.value.total || 0)
  const totalAgentsBySite = computed(() => agentStats.value.bySite || {})
  const totalAgentsByFunction = computed(() => agentStats.value.byFonction || {})
  const totalAgentsBySexe = computed(() => agentStats.value.bySexe || {})
  const totalAgentsByStatus = computed(() => agentStats.value.byStatus || {})

  const agents = computed(() => agentsPaginated.value.data || [])

  /* INTERNAL HELPER */
  const setPaginatedResponse = (response, params = {}) => {
    agentsPaginated.value = {
      data: response.data || [],
      page: response.pagination.page || params.page || 1,
      pages: response.pagination.pages || params.pages || 1,
      limit: response.pagination.limit || params.limit || 100,
      total: response.pagination.total || 0,
      hasNext: response.pagination.hasNext || false,
      hasPrev: response.pagination.hasPrev || false
    }

    pagination.value = {
      page: agentsPaginated.value.page,
      pages: agentsPaginated.value.pages,
      limit: agentsPaginated.value.limit,
      total: agentsPaginated.value.total,
      hasNext: agentsPaginated.value.hasNext,
      hasPrev: agentsPaginated.value.hasPrev
    }
  }

  


  // --- Statistiques globales (base pour pagination par site/fonction)
  const fetchAgentStats = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getAgentStats()
      agentStats.value = { ...response.data.data }
      return response.data
    } catch (err) {
      error.value = err.message || "Erreur statistiques"
      agentStats.value = { ...DEFAULT_AGENT_STATS }
    } finally {
      loading.value = false
    }
  }

  // --- Recherche par ID agent
  const fetchAgentById = async (id) => {
    if (!id) return
    loading.value = true
    error.value = null
    try {
      const response = await getAgentById(id)
      agent.value = { ...response.data }

      console.log("Id by :", response);
      

      return response.data
    } catch (err) {
      error.value = err.message || "Erreur recherche ID"
      agent.value = { ...DEFAULT_AGENT }
    } finally {
      loading.value = false
    }
  }

  // --- Recherche par CAC
  const searchAgentsByCAC = async (cacId) => {
    if (!cacId) return
    loading.value = true
    error.value = null
    try {
      const response = await getAgentByCAC(cacId)
      console.log("reponse ID CAC", response);
      
      agent.value = { ...response.data.data }

      return response.data
    } catch (err) {
      error.value = err.message || "Erreur recherche CAC"
      agent.value = { ...DEFAULT_AGENT }
    } finally {
      loading.value = false
    }
  }

  // --- Recherche par site avec pagination
  const searchAgentsBySite = async (siteName, params) => {
    console.log("query by site : ", siteName, params )
    if (!siteName) return
    loading.value = true
    error.value = null
    try {
      const response = await getAgentsBySite(siteName, params)
      console.log("reponse site :", response.data)
      setPaginatedResponse(response.data, params)

      console.log("reponse site agent :", agentsPaginated.value)
      console.log("reponse site page:", pagination.value)

      return response.data

    } catch (err) {
      error.value = err.message || "Erreur recherche site"
      agentsPaginated.value = { ...DEFAULT_AGENTS_PAGINATED }
    } finally {
      loading.value = false
    }
  }

  // --- Recherche par fonction avec pagination
  const searchAgentsByFunction = async (fonction, params = { page: 1, limit: 100 }) => {
    if (!fonction) return
    loading.value = true
    error.value = null
    try {
      const response = await getAgentsByFunction(fonction, params)
      console.log("response fonction:", response);
      setPaginatedResponse(response.data, params)

      console.log("response fonction:", response);
      

      return response.data

    } catch (err) {
      error.value = err.message || "Erreur recherche fonction"
      agentsPaginated.value = { ...DEFAULT_AGENTS_PAGINATED }
    } finally {
      loading.value = false
    }
  }

  // --- Recherche par champ spécifique
  const searchAgentsByField = async (fieldName, params) => {
    if (!fieldName || !params?.value) return
    loading.value = true
    error.value = null
    try {
      console.log("search by field :",fieldName, params)
      const response = await getAgentsByField(fieldName, params)
      console.log("result by field", response);
      
      setPaginatedResponse(response.data, params)
      searchByFieldParams.value = { ...DEFAULT_AGENT_SEARCH_BY_FIELD, ...params }

      return response.data
    } catch (err) {
      error.value = err.message || "Erreur recherche champ"
      agentsPaginated.value = { ...DEFAULT_AGENTS_PAGINATED }
    } finally {
      loading.value = false
    }
  }

  // --- Recherche globale / multi-critères (smart search)
  const advancedSearch = async (params) => {
    if (!params) return
    loading.value = true
    error.value = null
    try {
      console.log(params);
      
      const response = await searchAgents(params)
      setPaginatedResponse(response.data, params)
      return response.data
      
    } catch (err) {
      error.value = err.message || "Erreur recherche avancée"
      agentsPaginated.value = { ...DEFAULT_AGENTS_PAGINATED }
      return err
    } finally {
      loading.value = false
    }
  }

  // --- Réinitialiser le store
  const resetState = () => {
    agent.value = { ...DEFAULT_AGENT }
    agentStats.value = { ...DEFAULT_AGENT_STATS }
    agentsPaginated.value = { ...DEFAULT_AGENTS_PAGINATED }
    pagination.value = { ...DEFAULT_PAGINATION }
    error.value = null
    searchParams.value = { ...DEFAULT_AGENT_SEARCH }
    searchByFieldParams.value = { ...DEFAULT_AGENT_SEARCH_BY_FIELD }
  }

  return {
    /* STATE */
    agent,
    agentStats,
    agentsPaginated,
    pagination,
    loading,
    error,
    searchParams,
    searchByFieldParams,

    /* GETTERS */
    agents,
    totalAgents,
    totalAgentsBySite,
    totalAgentsByFunction,
    totalAgentsBySexe,
    totalAgentsByStatus,

    /* ACTIONS */
    fetchAgentStats,
    fetchAgentById,
    searchAgentsByCAC,
    searchAgentsBySite,
    searchAgentsByFunction,
    searchAgentsByField,
    advancedSearch,
    resetState
  }

}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: "agent-store",
        storage: localStorage,
        paths: ["agentsPaginated", "pagination", "searchParams"]
      }
    ]
  }
})