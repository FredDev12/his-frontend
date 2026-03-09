<script setup>
import { ref, computed } from "vue"
import { 
  searchAgents, 
  searchAgentsByField,
  getAgentsBySite,
  getAgentsByFunction,
  getAgentByCAC 
} from "../../../api/agents.api"
import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"
import { useToastStore } from "../../../stores/toast.store"

// Types de recherche disponibles
const searchTypes = [
  { value: "multi", label: "Recherche avancée", icon: "🔍", endpoint: "search" },
  { value: "nom", label: "Par nom", icon: "👤", field: "nom_post" },
  { value: "cac", label: "Par CAC ID", icon: "🆔", endpoint: "cac" },
  { value: "site", label: "Par site", icon: "🏥", endpoint: "site" },
  { value: "fonction", label: "Par fonction", icon: "💼", endpoint: "function" }
]

const searchType = ref("multi")
const query = ref("")
const agents = ref([])
const selectedCacId = ref(null)

// Filtre local pour site et fonction
const localFilter = ref("")

// Champs pour la recherche avancée
const advancedFilters = ref({
  cac_id_co: "",
  nom_post: "",
  prenom: "",
  site: "",
  telephone: "",
  fonction: ""
})

const searching = ref(false)
const hasSearched = ref(false)
const showAdvanced = ref(false)
const totalAgents = ref(0)

const toast = useToastStore()
const emit = defineEmits(["selectAgent"])

const normalize = (q) => (q || "").toString().trim().replace(/\s+/g, " ")

// Agents filtrés localement pour site et fonction
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

// Validation selon le type de recherche
const isValidSearch = computed(() => {
  if (searchType.value === "multi") {
    return Object.values(advancedFilters.value).some(v => v.trim().length >= 2)
  }
  
  if (["site", "fonction", "cac"].includes(searchType.value)) {
    return query.value.trim().length >= 2
  }
  
  return query.value.trim().length >= 2
})

// Indicateur de filtrage
const filterActive = computed(() => {
  return localFilter.value.length >= 2 && filteredAgents.value.length !== agents.value.length
})

// Exécuter la recherche selon le type sélectionné
const search = async () => {
  if (!isValidSearch.value) {
    agents.value = []
    hasSearched.value = true
    return toast.add("Veuillez saisir au moins 2 caractères", "info")
  }

  searching.value = true
  hasSearched.value = true
  localFilter.value = "" // Reset filtre local

  try {
    let res = null
    
    switch (searchType.value) {
      case "multi":
        const params = {}
        Object.entries(advancedFilters.value).forEach(([key, value]) => {
          if (value.trim()) params[key] = normalize(value)
        })
        res = await searchAgents(params)
        agents.value = res?.data?.data || []
        totalAgents.value = res?.data?.total || agents.value.length
        break
        
      case "nom":
        res = await searchAgentsByField("nom_post", normalize(query.value))
        agents.value = res?.data?.data || []
        totalAgents.value = res?.data?.total || agents.value.length
        break
        
      case "cac":
        try {
          res = await getAgentByCAC(normalize(query.value))
          agents.value = res?.data?.data ? [res.data.data] : []
          totalAgents.value = agents.value.length
        } catch (err) {
          agents.value = []
          totalAgents.value = 0
        }
        break
        
      case "site":
        res = await getAgentsBySite(normalize(query.value))
        agents.value = res?.data?.data || []
        totalAgents.value = res?.data?.total || agents.value.length
        break
        
      case "fonction":
        res = await getAgentsByFunction(normalize(query.value))
        agents.value = res?.data?.data || []
        totalAgents.value = res?.data?.total || agents.value.length
        break
    }
    
    if (agents.value.length > 0) {
      toast.add(`${agents.value.length} agent(s) trouvé(s)`, "success")
    } else {
      toast.add("Aucun agent trouvé", "info")
    }
  } catch (err) {
    console.error("Erreur recherche:", err)
    agents.value = []
    totalAgents.value = 0
    toast.add("Erreur lors de la recherche", "error")
  } finally {
    searching.value = false
  }
}

const pick = (agent) => {
  selectedCacId.value = agent.cac_id_co
  emit("selectAgent", agent)

  // Reset
  query.value = ""
  localFilter.value = ""
  advancedFilters.value = {
    cac_id_co: "",
    nom_post: "",
    prenom: "",
    site: "",
    telephone: "",
    fonction: ""
  }
  agents.value = []
}

// Réinitialiser les filtres
const resetFilters = () => {
  advancedFilters.value = {
    cac_id_co: "",
    nom_post: "",
    prenom: "",
    site: "",
    telephone: "",
    fonction: ""
  }
  query.value = ""
  localFilter.value = ""
}

// Obtenir le placeholder selon le mode
const getPlaceholder = () => {
  switch (searchType.value) {
    case "site": return "Nom du site (ex: KINSHASA, LUBUMBASHI...)"
    case "fonction": return "Fonction (ex: MEDECIN, INFIRMIER...)"
    case "cac": return "ID CAC (ex: CAC001234)"
    case "nom": return "Nom de l'agent"
    default: return "Saisissez une valeur..."
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- En-tête -->
    <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-gray-800 flex items-center gap-2">
            <span class="text-blue-600">🔍</span>
            Recherche d'agent CAC
          </h3>
          <p class="text-xs text-gray-600 mt-1">
            Recherchez un agent par différents critères
          </p>
        </div>
        
        <!-- Sélecteur de type de recherche -->
        <div class="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
          <button
            v-for="type in searchTypes"
            :key="type.value"
            @click="searchType = type.value"
            class="px-3 py-1.5 text-sm rounded-md transition flex items-center gap-1"
            :class="[
              searchType === type.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            <span>{{ type.icon }}</span>
            <span class="hidden sm:inline">{{ type.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Zone de recherche -->
    <div class="p-6">
      <!-- Recherche simple -->
      <div v-if="searchType !== 'multi'" class="flex flex-col sm:flex-row items-end gap-4">
        <div class="flex-1 w-full">
          <label class="text-sm font-medium text-gray-600 mb-1.5 block">
            {{ searchTypes.find(t => t.value === searchType)?.label }}
          </label>
          <BaseInput
            v-model="query"
            :placeholder="getPlaceholder()"
            class="w-full"
            @keyup.enter="search"
          />
        </div>

        <div class="flex gap-2 w-full sm:w-auto">
          <BaseButton 
            variant="primary" 
            @click="search" 
            :loading="searching"
            :disabled="!isValidSearch"
            class="flex-1 sm:flex-none"
          >
            <span class="flex items-center gap-2">
              <span>🔍</span>
              {{ searching ? "Recherche..." : "Rechercher" }}
            </span>
          </BaseButton>
          
          <BaseButton 
            v-if="query"
            variant="secondary" 
            @click="query = ''"
            class="px-3"
          >
            ✕
          </BaseButton>
        </div>
      </div>

      <!-- Recherche avancée multicritères -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-600">
            Filtres de recherche avancée
          </label>
          <button 
            @click="showAdvanced = !showAdvanced"
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>{{ showAdvanced ? '▼' : '▶' }}</span>
            {{ showAdvanced ? 'Masquer' : 'Afficher' }} les filtres
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="advancedFilters.nom_post"
            label="Nom"
            placeholder="Ex: MONTEIRO"
          />
          <BaseInput
            v-model="advancedFilters.prenom"
            label="Prénom"
            placeholder="Ex: Jean"
          />
        </div>

        <div v-if="showAdvanced" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <BaseInput
            v-model="advancedFilters.cac_id_co"
            label="CAC ID"
            placeholder="Ex: CAC001234"
          />
          <BaseInput
            v-model="advancedFilters.site"
            label="Site"
            placeholder="Ex: KINSHASA"
          />
          <BaseInput
            v-model="advancedFilters.fonction"
            label="Fonction"
            placeholder="Ex: MEDECIN"
          />
          <BaseInput
            v-model="advancedFilters.telephone"
            label="Téléphone"
            placeholder="Ex: 243812345678"
          />
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          <BaseButton 
            variant="primary" 
            @click="search" 
            :loading="searching"
            :disabled="!isValidSearch"
          >
            <span class="flex items-center gap-2">
              <span>🔍</span>
              {{ searching ? "Recherche en cours..." : "Lancer la recherche" }}
            </span>
          </BaseButton>
          
          <BaseButton 
            variant="secondary" 
            @click="resetFilters"
            :disabled="!Object.values(advancedFilters).some(v => v)"
          >
            Réinitialiser
          </BaseButton>
        </div>
      </div>

      <!-- Indicateur de recherche -->
      <div v-if="searching" class="mt-4 flex items-center gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Recherche en cours...
      </div>
    </div>

    <!-- Barre de filtrage pour site et fonction -->
    <div v-if="agents.length > 0 && (searchType === 'site' || searchType === 'fonction')" class="px-6 py-3 bg-gray-50 border-y border-gray-100">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex-1 w-full">
          <div class="relative">
            <BaseInput
              v-model="localFilter"
              placeholder="Filtrer par nom d'agent..."
              class="w-full"
            >
              <template #prefix>
                <span class="text-gray-400">🔍</span>
              </template>
            </BaseInput>
          </div>
        </div>
        
        <div class="text-sm text-gray-600 whitespace-nowrap">
          <span class="font-medium">{{ filteredAgents.length }}</span>
          <span class="text-gray-400"> / {{ agents.length }}</span>
          <span v-if="filterActive" class="ml-2 text-blue-600 text-xs">
            (filtré)
          </span>
        </div>
      </div>
    </div>

    <!-- Résultats -->
    <div v-if="agents.length > 0" class="border-t border-gray-100">
      <div class="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">
          {{ filteredAgents.length }} résultat(s) affiché(s)
          <span v-if="filteredAgents.length !== agents.length" class="text-gray-400 text-xs ml-2">
            (sur {{ agents.length }} total)
          </span>
        </span>
        <span class="text-xs text-gray-500">Cliquez sur un agent pour le sélectionner</span>
      </div>

      <div class="p-6 max-h-96 overflow-y-auto custom-scroll space-y-3">
        <button
          v-for="a in filteredAgents"
          :key="a.cac_id_co"
          type="button"
          @click="pick(a)"
          class="w-full text-left transition-all"
          :class="[
            selectedCacId === a.cac_id_co 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : 'hover:ring-1 hover:ring-gray-200'
          ]"
        >
          <!-- Carte agent -->
          <div class="bg-white border rounded-xl p-5 hover:shadow-md transition">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {{ (a.nom_post || 'A').charAt(0) }}
                </div>
                
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-gray-800">
                      {{ a.nom_post }} 
                      <span v-if="a.prenom && a.prenom !== 'null'" class="font-normal">
                        {{ a.prenom }}
                      </span>
                    </span>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {{ a.cac_id_co }}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span>{{ a.fonction || "Fonction non renseignée" }}</span>
                    <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{{ a.site || "Site non renseigné" }}</span>
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <BaseBadge :type="a.sexe === 'M' ? 'primary' : 'warning'" size="sm">
                  {{ a.sexe === 'M' ? 'Homme' : 'Femme' }}
                </BaseBadge>
                <BaseBadge 
                  v-if="a.statut_marital && a.statut_marital !== '-'" 
                  type="success" 
                  size="sm"
                >
                  {{ a.statut_marital }}
                </BaseBadge>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span class="text-xs text-gray-500 block">Conjoint</span>
                <span class="text-sm font-medium text-gray-700">
                  {{ a.nom_conjoint && a.nom_conjoint !== '-' ? a.nom_conjoint : 'Non renseigné' }}
                </span>
              </div>
              
              <div>
                <span class="text-xs text-gray-500 block">Enfants</span>
                <span class="text-sm font-medium text-gray-700">
                  {{ a.nbre_enfa || '0' }}
                </span>
              </div>
              
              <div>
                <span class="text-xs text-gray-500 block">Parents</span>
                <span class="text-sm font-medium text-gray-700">
                  {{ a.parents && a.parents !== '-' ? a.parents : 'Non renseigné' }}
                </span>
              </div>
            </div>

            <!-- Highlight du terme recherché (optionnel) -->
            <div v-if="localFilter && filterActive" class="mt-2 text-xs text-blue-600">
              Correspond au filtre "{{ localFilter }}"
            </div>

            <div 
              v-if="selectedCacId === a.cac_id_co"
              class="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg"
            >
              <span class="text-lg">✓</span>
              <span class="font-medium">Agent sélectionné</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- États vides -->
    <div 
      v-else-if="hasSearched && !searching" 
      class="p-12 text-center border-t border-gray-100"
    >
      <div class="text-5xl mb-4 opacity-30">👤</div>
      <p class="text-gray-500 font-medium">Aucun agent trouvé</p>
      <p class="text-sm text-gray-400 mt-1">
        Essayez avec d'autres critères de recherche
      </p>
    </div>

    <div 
      v-else-if="!hasSearched && !searching" 
      class="p-12 text-center border-t border-gray-100"
    >
      <div class="text-5xl mb-4 opacity-30">🔍</div>
      <p class="text-gray-500 font-medium">Recherchez un agent</p>
      <p class="text-sm text-gray-400 mt-1">
        Utilisez les différents modes de recherche ci-dessus
      </p>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 20px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 20px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>