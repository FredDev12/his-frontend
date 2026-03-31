// components/agents/constants/searchTypes.js
export const SEARCH_TYPES = [
  { value: "multi", label: "Recherche avancée", icon: "🔍", endpoint: "search" },
  { value: "nom", label: "Par nom", icon: "👤", field: "nom_post" },
  { value: "cac", label: "Par CAC ID", icon: "🆔", endpoint: "cac" },
  { value: "site", label: "Par site", icon: "🏥", endpoint: "site" },
  { value: "fonction", label: "Par fonction", icon: "💼", endpoint: "function" }
]

export const PAGE_SIZE_OPTIONS = [50, 100, 200, 500]

export const PLACEHOLDERS = {
  site: "Nom du site (ex: KINSHASA, LUBUMBASHI...)",
  fonction: "Fonction (ex: MEDECIN, INFIRMIER...)",
  cac: "ID CAC (ex: CAC001234)",
  nom: "Nom de l'agent",
  default: "Saisissez une valeur..."
}