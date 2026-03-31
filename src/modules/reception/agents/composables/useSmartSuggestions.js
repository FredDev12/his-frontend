import { useAgentStore } from "../stores/agents.store"

export function useSmartSuggestions() {

  const agentStore = useAgentStore()

  const getSuggestions = async (query) => {

    if (!query || query.length < 2) return []

    const nom_post = query.toLowerCase()

    const suggestions = []

    // ===== agents =====
    const result = await agentStore.advancedSearch({ nom_post, page:1,limit: 100 })

    const agents = result?.data || result?.agents || []

    console.log("auto suggestion resulta: ", result);
    console.log("auto suggestion : ", agents);
    

    agents.forEach(a => {

      suggestions.push({
        nom_post: `${a.nom_post}`,
        prenom: `${a.prenom}`,
        cac_id_co: `${a.cac_id_co}`,
        fonction: `${a.fonction}`,
        site: `${a.site}`,
        telephone: `${a.telephone}`
      })

    })

    // ===== sites =====
    

    return suggestions
  }

  return { getSuggestions }

}