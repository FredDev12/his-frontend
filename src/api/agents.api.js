import api from "./axios"

/**
 * Lister les agents (API externe)
 * @param {number} page - Numéro de page (défaut: 1)
 * @param {number} limit - Nombre d'éléments par page (défaut: 100)
 * @returns {Promise}
 */
export const getAgents = (page = 1, limit = 100) =>
  api.get("/agents", { params: { page, limit } })

/**
 * Recherche avancée d'agents
 * @param {Object} params - Paramètres de recherche
 * @param {string} [params.cac_id_co] - ID CAC
 * @param {string} [params.nom_post] - Nom
 * @param {string} [params.prenom] - Prénom
 * @param {string} [params.site] - Site
 * @param {string} [params.telephone] - Téléphone
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=100] - Limite par page
 * @returns {Promise}
 */
export const searchAgents = (params) =>
  api.get("/agents/search", { params })

/**
 * Recherche par champ spécifique
 * @param {string} fieldName - Nom du champ (ex: 'nom_post', 'site')
 * @param {string} value - Valeur à rechercher
 * @param {number} [page=1] - Numéro de page
 * @param {number} [limit=100] - Limite par page
 * @returns {Promise}
 */
export const searchAgentsByField = (fieldName, value, page = 1, limit = 100) =>
  api.get(`/agents/field/${fieldName}`, { params: { value, page, limit } })

/**
 * Récupérer un agent par son CAC ID
 * @param {string} cacId - ID CAC de l'agent
 * @returns {Promise}
 */
export const getAgentByCAC = (cacId) =>
  api.get(`/agents/cac/${cacId}`)

/**
 * Récupérer les agents d'un site
 * @param {string} siteName - Nom du site
 * @param {number} [page=1] - Numéro de page
 * @param {number} [limit=100] - Limite par page
 * @returns {Promise}
 */
export const getAgentsBySite = (siteName, page = 1, limit = 100) =>
  api.get(`/agents/site/${siteName}`, { params: { page, limit } })

/**
 * Récupérer les agents par fonction
 * @param {string} fonction - Fonction de l'agent
 * @param {number} [page=1] - Numéro de page
 * @param {number} [limit=100] - Limite par page
 * @returns {Promise}
 */
export const getAgentsByFunction = (fonction, page = 1, limit = 100) =>
  api.get(`/agents/function/${fonction}`, { params: { page, limit } })

/**
 * Récupérer un agent par son ID interne
 * @param {number} id - ID de l'agent
 * @returns {Promise}
 */
export const getAgentById = (id) =>
  api.get(`/agents/id/${id}`)

/**
 * Obtenir les statistiques sur les agents
 * @returns {Promise}
 */
export const getAgentStats = () =>
  api.get("/agents/statistiques")

// Pour la rétrocompatibilité, on garde les anciens noms si nécessaire
// export { getAgents as getAgentsList }
// export { searchAgents as searchAgentsList }