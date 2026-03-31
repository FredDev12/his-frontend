// src/modules/agents/composables/useSmartSearch.js
import { useAgentStore } from "../stores/agents.store"

export function useSmartSearch() {

  const agentStore = useAgentStore()

  const validFields = [
    "cac_id_co","nom_post","prenom","sexe","grand","fonction","nationalite",
    "site","adresse","statut_marital","nom_conjoint","nbre_enfa","nom_enfant",
    "telephone","date_de_naissance","parents","statutparents"
  ]

  const allowedFields = [
    "cac_id_co",
    "nom_post",
    "prenom",
    "site",
    "telephone"
  ]

  const normalizeQuery = (query) => {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
  }

  const cleanFilters = (obj) => {
    const cleaned = {}

    Object.keys(obj).forEach((key) => {

      const value = obj[key]

      // ✅ garder seulement les champs autorisés + non vides
      if (
        allowedFields.includes(key) &&
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        cleaned[key] = normalizeQuery(value.toString())
      }

    })

    return cleaned
  }

  /**
   * searchQuery peut être :
   * - une string (pour cac, site, fonction, agentId)
   * - un objet { main: string, extras: {...} } pour recherche globale multi-critères
   * typeSearch = "global" | "cac" | "site" | "fonction" | "agentId"
   */
  const search = async (searchQuery, params = { page: 1, limit: 100 }, typeSearch = "global") => {


    if (!searchQuery) return

    console.log("recherche smart :",searchQuery);

    

    switch(typeSearch) {

      case "cac":
      case "agentId":
        console.log("Recherche par CAC / ID Agent :", searchQuery)
        const query = searchQuery.toUpperCase();
        return await agentStore.searchAgentsByCAC(query)

      case "site":
        console.log("Recherche par site :", searchQuery)
        return await agentStore.searchAgentsBySite(searchQuery, params)

      case "fonction":
        console.log("Recherche par fonction :", searchQuery)
        return await agentStore.searchAgentsByFunction(searchQuery, params)

      case "global":
      default:

       let searchParams = {}

        // ✅ CAS 1 : recherche multi-critères (OBJET)
        if (typeof searchQuery === "object") {

          const filters = cleanFilters(searchQuery)

          console.log("Recherche multi-critères:", filters)

          searchParams = {
            ...filters,
            page: params.page,
            limit: params.limit
          }

        }
        // ✅ CAS 2 : recherche texte libre (STRING)
        else if (typeof searchQuery === "string") {

          const words = searchQuery.split(" ").filter(Boolean)

          if (words.length === 1) {
            searchParams = {
              nom_post: words[0],
              prenom: words[0],
              site: words[0],
              telephone: words[0],
            }
          }

          else if (words.length >= 2) {
            searchParams = {
              prenom: words[0],
              nom_post: words.slice(1).join(" ")
            }
          }
          

          searchParams.page = params.page
          searchParams.limit = params.limit
        }
        console.log("Recherche globale - Params finaux:", searchParams)

        return await agentStore.advancedSearch(searchParams)
    }
  }

  return { search }
}