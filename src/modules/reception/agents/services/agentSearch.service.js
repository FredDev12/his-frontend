// src/modules/agents/services/agentSearch.service.js

import { useAgentStore } from "../stores/agents.store"

export const useAgentSearchService = () => {

  const agentStore = useAgentStore()

  const searchByCAC = async (cacId) => {

    if (!cacId) return

    await agentStore.searchAgentsByCAC(cacId)

    return agentStore.agent
  }

  const searchBySite = async (site, params = { page: 1, limit: 100 }) => {

    if (!site) return

    await agentStore.searchAgentsBySite(site, params)

    return agentStore.agents
  }

  const searchByFunction = async (fonction, params = { page: 1, limit: 100 }) => {

    if (!fonction) return

    await agentStore.searchAgentsByFunction(fonction, params)

    return agentStore.agents
  }

  const searchByField = async (fieldName, value, params = { page: 1, limit: 100 }) => {

    if (!fieldName || !value) return

    await agentStore.searchAgentsByField(fieldName, {
      value,
      ...params
    })

    return agentStore.agents
  }

  const advancedSearch = async (params) => {

    await agentStore.advancedSearch(params)

    return agentStore.agents
  }

  const getAgentById = async (id) => {

    await agentStore.fetchAgentById(id)

    return agentStore.agent
  }

  return {

    searchByCAC,
    searchBySite,
    searchByFunction,
    searchByField,
    advancedSearch,
    getAgentById

  }

}