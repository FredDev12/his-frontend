import api from "./axios"

/**
 * Crée un nouvel utilisateur
 * @param {Object} data - Les données d'inscription
 * @param {string} data.email - Email de l'utilisateur
 * @param {string} data.password - Mot de passe de l'utilisateur
 * @param {string} data.nom - Nom de l'utilisateur
 * @param {string} data.prenom - Prénom de l'utilisateur
 * @param {string} data.role - Rôle de l'utilisateur (admin, user, etc.)
 * @returns {Promise<import('axios').AxiosResponse>} Réponse de l'API
 * 
 * @example
 * // Réponse 201 - Utilisateur créé
 * // Réponse 400 - Données invalides
 * // Réponse 409 - Email déjà utilisé
 */
export const register = (data) => api.post("/auth/register", data)


/**
 * Recuperer tous les utilisateur
 * @returns 
 * 
 * @example
 * 200 - informations utilisateur
 * 401 - non autorisé
 */
export const getUser = () => api.get("/auth/users")




/**
 * Vérifie la validité du token d'authentification
 * @returns {Promise<import('axios').AxiosResponse>} Réponse de l'API
 * 
 * @example
 * // Réponse 200 - Token valide
 * // Réponse 401 - Token invalide ou expiré
 */
export const verifyToken = () => api.get("/auth/verify")


/**
 * Met à jour le profil de l'utilisateur connecté
 * @param {Object} data - Les données à mettre à jour
 * @param {string} data.email - Nouvel email
 * @param {string} data.nom - Nouveau nom
 * @param {string} data.prenom - Nouveau prénom
 * @returns {Promise<import('axios').AxiosResponse>} Réponse de l'API
 * 
 * @returns {Object} Réponse formatée
 * @returns {string} response.data.message - Message de confirmation
 * @returns {Object} response.data.user - Données utilisateur mises à jour
 * @returns {number} response.data.user.id - ID de l'utilisateur
 * @returns {string} response.data.user.email - Email de l'utilisateur
 * @returns {string} response.data.user.nom - Nom de l'utilisateur
 * @returns {string} response.data.user.prenom - Prénom de l'utilisateur
 * @returns {string} response.data.user.role - Rôle de l'utilisateur
 * 
 * @example
 * // Réponse 200 - Profil mis à jour
 * // Réponse 400 - Requête invalide
 * // Réponse 401 - Non autorisé
 */
export const updateProfile = (data) => api.put("/auth/profile", data)

/**
 * Change le mot de passe de l'utilisateur connecté
 * @param {Object} data - Les données de changement de mot de passe
 * @param {string} data.currentPassword - Mot de passe actuel
 * @param {string} data.newPassword - Nouveau mot de passe
 * @returns {Promise<import('axios').AxiosResponse>} Réponse de l'API
 * 
 * @example
 * // Réponse 200 - Mot de passe changé
 * // Réponse 401 - Non autorisé (mot de passe actuel incorrect)
 */
export const changePassword = (data) => api.put("/auth/change-password", data)

/**
 * Récupère l'historique des connexions d'un utilisateur
 * @param {number|string} userId - ID de l'utilisateur
 * @returns {Promise<import('axios').AxiosResponse>} Réponse de l'API contenant les logs
 * 
 * @example
 * // Réponse 200 - Liste des logs
 * // Réponse 401 - Non autorisé
 * // Réponse 403 - Accès interdit (droits insuffisants)
 */
export const getLoginLogs = (userId) => api.get(`/auth/logs/${userId}`)