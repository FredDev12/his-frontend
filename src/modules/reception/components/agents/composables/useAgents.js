import { computed } from "vue"
import { useAgentStore } from "../stores/agents.store"
import { useAgentSearchService } from "../services/agentSearch.service"

export function useAgents() {

  const agentStore = useAgentStore()
  const agentService = useAgentSearchService()

  const agents = computed(() => agentStore.agents)
  const agent = computed(() => agentStore.agent)

  const loading = computed(() => agentStore.loading)
  const error = computed(() => agentStore.error)

  const pagination = computed(() => agentStore.pagination)

  const searchByCAC = async (cacId) => {
    return await agentService.searchByCAC(cacId)
  }

  const searchBySite = async (site, params) => {
    return await agentService.searchBySite(site, params)
  }

  const searchByFunction = async (fonction, params) => {
    return await agentService.searchByFunction(fonction, params)
  }

  const searchByField = async (field, value, params) => {
    return await agentService.searchByField(field, value, params)
  }

  const advancedSearch = async (params) => {
    return await agentService.advancedSearch(params)
  }

  const getAgentById = async (id) => {
    return await agentService.getAgentById(id)
  }

  const reset = () => {
    agentStore.resetState()
  }

  return {

    agents,
    agent,
    loading,
    error,
    pagination,

    searchByCAC,
    searchBySite,
    searchByFunction,
    searchByField,
    advancedSearch,
    getAgentById,

    reset

  }

}