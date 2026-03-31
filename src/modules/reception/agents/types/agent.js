// src/modules/agents/types/agent.js

// Structure PaginatedResponse selon Swagger
export const DEFAULT_PAGINATION = {
    page: 1,
    pages:1,
    limit: 100, // Changé de 10 à 100 selon Swagger
    total: 0,
    hasNext: false,
    hasPrev: false
}

// Structure Agent selon Swagger
export const DEFAULT_AGENT = {
    cac_id_co: "",
    nom_post: "",
    prenom: "",
    sexe: "",
    grand: "",
    fonction: "",
    nationalite: "",
    site: "",
    adresse: "",
    statut_marital: "",
    nom_conjoint: "",
    nbre_enfa: "", // Gardé comme string selon Swagger
    nom_enfant: "",
    telephone: "",
    date_de_naissance: "",
    parents: "",
    statutparents: ""
}

// Structure pour AgentsPaginated selon Swagger
export const DEFAULT_AGENTS_PAGINATED = {
    data: [],
    page: 1,
    limit: 100,
    total: 0,
    hasNext: false,
    hasPrev: false
}

// Structure pour les statistiques (déduite de Swagger)
export const DEFAULT_AGENT_STATS = {
    parSexe: {},
    parSite: {},
    parFonction: {},
    parStatut: {}
}

// Structure pour la recherche avancée (5 critères selon Swagger)
export const DEFAULT_AGENT_SEARCH = {
    cac_id_co: "",
    nom_post: "",
    prenom: "",
    site: "",
    telephone: "",
    page: 1,
    limit: 100
}

// Structure pour la recherche par champ
export const DEFAULT_AGENT_SEARCH_BY_FIELD = {
    fieldName: "",
    value: "", // Requis en query selon Swagger
    page: 1,
    limit: 100
}