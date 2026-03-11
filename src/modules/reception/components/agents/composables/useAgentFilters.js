// components/agents/composables/useAgentFilters.js
import { ref, computed } from "vue"

export function useAgentFilters(agents) {
  // Filtre local
  const localFilter = ref("")

  // Normaliser une chaîne
  const normalize = (q) => (q || "").toString().trim().replace(/\s+/g, " ")

  // Agents filtrés localement
  const filteredAgents = computed(() => {
    if (!localFilter.value || localFilter.value.length < 2) {
      return agents.value
    }
    
    const filter = normalize(localFilter.value).toLowerCase()
    
    return agents.value.filter(agent => {
      const nom = (agent.nom_post || "").toLowerCase()
      const prenom = (agent.prenom || "").toLowerCase()
      const fullName = `${nom} ${prenom}`.trim()
      
      return nom.includes(filter) || 
             prenom.includes(filter) || 
             fullName.includes(filter)
    })
  })

  // Indicateur de filtrage actif
  const filterActive = computed(() => {
    return localFilter.value.length >= 2 && 
           filteredAgents.value.length !== agents.value.length
  })

  // Réinitialiser le filtre
  const resetLocalFilter = () => {
    localFilter.value = ""
  }

  return {
    localFilter,
    filteredAgents,
    filterActive,
    resetLocalFilter,
    normalize
  }
}