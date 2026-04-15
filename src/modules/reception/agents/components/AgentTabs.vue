<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"

import AgentPersonalTab from "./AgentPersonalTab.vue"
import AgentSpouseTab from "./AgentSpouseTab.vue"
import AgentParentsTab from "./AgentParentsTab.vue"
import AgentChildrenTab from "./AgentChildrenTab.vue"

const props = defineProps({
  agent: Object
})

const router = useRouter()
const activeTab = ref("personnel")


// Calcul du statut des parents
const statusParent = computed(() => {
  if (!props.agent?.statutparents) {
    return { 
      pere: "Non renseigné", 
      mere: "Non renseigné" 
    }
  }
  
  let pere, mere
  const statutStr = props.agent.statutparents
  
  // Gestion des différents formats possibles
  if (statutStr.includes(' et ')) {
    [pere, mere] = statutStr.split(' et ').map(s => s.trim())
  } else if (statutStr.includes('et')) {
    [pere, mere] = statutStr.split('et').map(s => s.trim())
  } else if (statutStr.includes('ET')) {
    [pere, mere] = statutStr.split('ET').map(s => s.trim())
  } else if (statutStr.includes(',')) {
    [pere, mere] = statutStr.split(',').map(s => s.trim())
  } else {
    return { pere: statutStr, mere: "Non renseigné" }
  }
  
  return { pere, mere }
})

const parents = computed(() => {
  if (!props.agent.parents) return []

  return props.agent.parents.split("ET")
}) 

// Calcul des noms complets des parents
const parentNames = computed(() => {
  return {
    pere: parents.value ? 
      `${parents.value[0] || ''}`.trim() : 
      "Non renseigné",
    mere: parents.value ? 
      `${parents.value[1] || ''}`.trim() : 
      "Non renseigné"
  }
})


// Objet parent formaté pour le composant enfant
const parentsInfo = computed(() => {
  return {
    pere: {
      nom: parentNames.value.pere,
      statut: statusParent.value.pere,
      enVie: statusParent.value.pere?.toUpperCase().includes("VIE") && 
              !statusParent.value.pere?.toUpperCase().includes("DÉCÉDÉ")
    },
    mere: {
      nom: parentNames.value.mere,
      statut: statusParent.value.mere,
      enVie: statusParent.value.mere?.toUpperCase().includes("VIE") && 
              !statusParent.value.mere?.toUpperCase().includes("DÉCÉDÉ")
    }
  }
})

// Calcul si au moins un parent est en vie
const hasLivingParent = computed(() => {
  return parentsInfo.value.pere.enVie || parentsInfo.value.mere.enVie
})

// Calcul si les deux parents sont décédés
const bothParentsDeceased = computed(() => {
  const pereDecede = parentsInfo.value.pere.statut?.toUpperCase().includes("DÉCÉDÉ") || false
  const mereDecede = parentsInfo.value.mere.statut?.toUpperCase().includes("DÉCÉDÉ") || false
  
  return pereDecede && mereDecede
})

const hasSpouse = computed(() => {
  if (!props.agent?.statut_marital) return false
  
  return props.agent.statut_marital.toLowerCase() !== "célibataire"
})

const hasChild = computed(() => {
  return Number(props.agent?.nbre_enfa ?? 0) > 0
})

// Objet parent formaté pour le composant enfant
const parentInfo = computed(() => ({
  pere: {
    nom: parentsInfo.value.pere.nom,
    statut: parentsInfo.value.pere.statut,
    enVie: parentsInfo.value.pere.enVie
  },
  mere: {
    nom: parentsInfo.value.mere.nom,
    statut: parentsInfo.value.mere.statut,
    enVie: parentsInfo.value.mere.enVie
  },
  decede: bothParentsDeceased.value
}))

console.log("agentTabs : ",parentInfo.value);



</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-4">
      Dossier Médical
    </h2>

    <!-- Affichage debug (à supprimer en production) -->
    <div v-if="false" class="bg-gray-100 p-2 mb-4 text-sm">
      <p>Statut parents: {{ statusParent }}</p>
      <p>Has living parent: {{ hasLivingParent }}</p>
    </div>

    <!-- Navigation par onglets -->
    <div class="flex border-b text-lg py-2 gap-6 mb-6">
      <button
        @click="activeTab = 'personnel'"
        class="pb-2 px-1 transition-colors"
        :class="activeTab === 'personnel' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'"
      >
        Personnel
      </button>

      <button
        v-if="hasSpouse"
        @click="activeTab = 'conjoint'"
        class="pb-2 px-1 transition-colors"
        :class="activeTab === 'conjoint' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'"
      >
        Conjoint
      </button>

      <!--
      <button
        v-if="hasLivingParent"
        @click="activeTab = 'parents'"
        class="pb-2 px-1 transition-colors"
        :class="activeTab === 'parents' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'"
      >
        Parents
      </button>
      -->
      
      <button
        v-if="hasChild"
        @click="activeTab = 'enfants'"
        class="pb-2 px-1 transition-colors"
        :class="activeTab === 'enfants' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'"
      >
        Enfants ({{ agent.nbre_enfa }})
      </button>
    </div>

    <!-- Contenu des onglets -->
    <div class="tab-content">
      <AgentPersonalTab
        v-if="activeTab === 'personnel'"
        :agent="agent"
      />

      <AgentSpouseTab
        v-if="activeTab === 'conjoint'"
        :agent="agent"
      />

      <AgentParentsTab
        v-if="activeTab === 'parents'"
        :agent="agent"
        :parents="parentInfo"
      />

      <AgentChildrenTab
        v-if="activeTab === 'enfants'"
        :agent="agent"
      />
    </div>
  </div>
</template>