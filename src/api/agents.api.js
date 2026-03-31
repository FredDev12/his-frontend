// src/api/agents.api.js

import api from "./axios"

// GET /api/agents - Liste paginée des agents
export const getAgents = (params = { page: 1, limit: 100 }) => 
    api.get("/agents", { params })

// GET /api/agents/search - Recherche avancée (5 critères)
export const searchAgents = (params) => 
    api.get("/agents/search", { params })

// GET /api/agents/statistiques - Statistiques globales
export const getAgentStats = () => 
    api.get("/agents/statistiques")

// GET /api/agents/cac/{cacId} - Agent par CAC ID
export const getAgentByCAC = (cacId) => 
    api.get(`/agents/cac/${cacId}`)

// GET /api/agents/site/{siteName} - Agents par site avec pagination
export const getAgentsBySite = (siteName, params = { page: 1, limit: 100 }) => 
    api.get(`/agents/site/${siteName}`, { params })

// GET /api/agents/function/{fonction} - Agents par fonction avec pagination
export const getAgentsByFunction = (fonction, params = { page: 1, limit: 100 }) => 
    api.get(`/agents/function/${fonction}`, { params })

// GET /api/agents/field/{fieldName} - Recherche par champ arbitraire
export const getAgentsByField = (fieldName, params) => {
    // 'value' est requis en query param selon Swagger
    return api.get(`/agents/field/${fieldName}`, { params })
}

// GET /api/agents/id/{id} - Agent par ID numérique
export const getAgentById = (id) => 
    api.get(`/agents/id/${id}`)