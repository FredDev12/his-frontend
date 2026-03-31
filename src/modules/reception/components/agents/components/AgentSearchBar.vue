<template>
  <div class="w-full max-w-h mx-auto space-y-3">

    <!-- 🔹 Sélecteur Type Recherche avec RadioGroup -->
    <RadioGroup
        v-if="!typeSearch"
      v-model="searchType"
      :options="radioOptions"
    />

    
    <!-- 🔹 Barre de recherche principale --> 
    <div class="flex flex-wrap  gap-2">
        <input
            v-model="localValue"
            @keyup.enter="onSearch"
            :placeholder="getPlaceholder"
            class="px-4  gap-2 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <input
            v-if="searchType === 'global'"
            v-for="field in extraFields"
            :key="field"
            v-model="extraValues[field]"
            @keyup.enter="onSearch"
            :placeholder="field"
            class="px-3 py-1 border rounded text-sm flex-1 min-w-[100px]"
        />
     
    </div>

    <button
        @click="onSearch"
        :disabled="loading || !isValidInput"
        class="flex-1 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
    >
        {{ loading ? 'Recherche...' : 'Rechercher' }}
    </button>

    

    <!-- Guide dynamique -->
    <div class="text-gray-600 text-sm mt-2 bg-gray-50 p-2 rounded border border-gray-200">
      💡 {{ dynamicGuide }}<br>
      <span class="text-gray-400 text-xs">{{ dynamicExample }}</span>
    </div>

    

    <!-- Error -->
    <div v-if="agentStore.error" class="mt-2 text-red-600">
      {{ agentStore.error }}
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue"
import { debounce } from "lodash"
import { useAgentStore } from "../stores/agents.store"
import { useSmartSuggestions } from "../composables/useSmartSuggestions"
import RadioGroup from "../../../../../components/ui/RadioGroup.vue"
import { useRouter } from "vue-router"

const props = defineProps({
  modelValue: String,
  loading: Boolean,
  typeSearch: String
})
const emit = defineEmits(["update:modelValue", "search"])

const agentStore = useAgentStore()
const { getSuggestions } = useSmartSuggestions()

// 🔹 Etat
const searchType = ref("global")
const suggestions = ref([])
const extraFields = ["prenom","site","cac_id_co","telephone"]
const extraValues = reactive(Object.fromEntries(extraFields.map(f => [f, ""])))
const router = useRouter()

// 🔹 Options pour RadioGroup
const radioOptions = [
  { label: "Multi-critères", value: "global", color: "blue" },
  { label: "CAC ID", value: "cac", color: "green" },
  { label: "Nom du site", value: "site", color: "yellow" },
  { label: "Fonction", value: "fonction", color: "purple" },
  //{ label: "ID Agent", value: "agentId", color: "red" },
]


const dynamicGuide = ref("Tapez un CAC ID, un site, un champ:valeur ou plusieurs mots.")
const dynamicExample = ref("Ex: 12345, site Kintambo, nom_post:Kabongo")

const isValidInput = computed(() => {

  const hasMain =
    typeof localValue.value === "string" &&
    localValue.value.trim().length > 0

  const hasExtras = Object.values(extraValues)
    .some(v => typeof v === "string" && v.trim().length > 0)

  return hasMain || hasExtras
})


// 🔹 Placeholder dynamique
const getPlaceholder = computed(() => {
  switch(searchType.value){
    case "cac": return "Entrez le CAC ID"
    case "site": return "Nom du site"
    case "fonction": return "Fonction"
    case "agentId": return "ID Agent"
    default: return "Rechercher nom_post ou autres champs…"
  }
})

const combinedQuery = computed(() => {

  const main = typeof localValue.value === "string"
    ? localValue.value.trim()
    : ""

  const extras = Object.values(extraValues)
    .filter(v => typeof v === "string" && v.trim())
    .join(" ")

  return [main, extras].filter(Boolean).join(" ")
})

// 🔥 Input & Search
watch(() => combinedQuery, val => {
    if (!val) {
        suggestions.value = []
        return
    }
    updateGuide(val)
    fetchSuggestions(val)
})

watch(searchType, () => {
  resetFields()
  updateGuide()
})

const resetFields = () => {
  // vider input principal
  localValue.value = ""

  // vider champs supplémentaires
  Object.keys(extraValues).forEach(key => {
    extraValues[key] = ""
  })

  // vider suggestions
  suggestions.value = []

  // reset parent (important)
  emit("update:modelValue", "")
}

// 🔹 valeur locale pour input
const localValue = ref(props.modelValue || "")

// 🔹 sync prop -> local
watch(() => combinedQuery, val => {
  if(!val){
    localValue.value = val
  }
})

// 🔹 sync local -> parent
watch (localValue,val => {
  emit("update:modelValue", val)
})

const onSearch = () => {
    if(!isValidInput.value) return

    suggestions.value = []

    let searchPayload = localValue.value

    if(searchType.value === "global"){
        searchPayload = { 
            ...(localValue.value?.trim() && { nom_post: localValue.value }),
            ...Object.fromEntries(
            Object.entries(extraValues).filter(([_, v]) => v && v.trim())
         )
        }
    }
    emit("search", {
        payload:searchPayload, 
        type: searchType.value
    })
}

const fetchSuggestions = debounce(async (value) => {
  if (typeof value !== "string") return  

  suggestions.value = value.trim()
    ? await getSuggestions(value)
    : []
}, 300)

const selectSuggestion = (agent ) => {
  emit("update:modelValue", agent.nom_post || "")

  emit("search", {
    payload: agent.nom_post || "",
    type: searchType.value
  })
  
  suggestions.value = []
}

// 🔹 Guide dynamique
const updateGuide = (value) => {
    if (typeof value !== "string") return 

    const trimmed = value.trim()
    if (!trimmed) {
        dynamicGuide.value = "Tapez un CAC ID, un site, un champ:valeur ou plusieurs mots."
        dynamicExample.value = "Ex: 12345, site Kintambo, nom_post:Kabongo"
        return
    }

    if (/^\d{1,6}$/.test(trimmed)) {
        dynamicGuide.value = "Recherche par CAC ID détectée."
        dynamicExample.value = "Ex: 12345"
        return
    }

    if (trimmed.toLowerCase().startsWith("site")) {
        dynamicGuide.value = "Recherche par site"
        dynamicExample.value = "site Kintambo"
        return
    }

    if (["poste", "fonction"].some(k => trimmed.toLowerCase().startsWith(k))) {
        dynamicGuide.value = "Recherche par fonction"
        dynamicExample.value = "fonction Directeur"
        return
    }

    dynamicGuide.value = "Recherche multi-critères"
    dynamicExample.value = "Jean Directeur Kintambo"
}
</script>