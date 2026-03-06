import api from "./axios"

export const getAgents = (page=1,limit=100)=>
api.get("/agents",{params:{page,limit}})

export const searchAgents = (params)=>
api.get("/agents/search",{params})

export const getAgentByCAC = (cacId)=>
api.get(`/agents/cac/${cacId}`)

export const getAgentById = (id)=>
api.get(`/agents/id/${id}`)

export const getAgentsBySite = (site)=>
api.get(`/agents/site/${site}`)

export const getAgentsByFunction = (fonction)=>
api.get(`/agents/function/${fonction}`)

export const getAgentStats = () =>
api.get("/agents/statistiques")