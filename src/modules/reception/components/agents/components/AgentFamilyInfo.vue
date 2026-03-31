<script setup>
import { computed } from "vue"

const props = defineProps({
  agent: Object
})

// Extraction du statut des parents
const statusParent = computed(() => {
  if (!props.agent?.statutparents) {
    return { pere: "Non renseigné", mere: "Non renseigné" }
  }
  
  const statutStr = props.agent.statutparents
  const separators = [' et ', 'et', 'ET', ',']
  
  for (const sep of separators) {
    if (statutStr.includes(sep)) {
      const [pere, mere] = statutStr.split(sep).map(s => s.trim())
      return { pere, mere: mere || "Non renseigné" }
    }
  }
  
  // Si aucun séparateur trouvé
  return { pere: statutStr, mere: "Non renseigné" }
})

// Extraction des noms des parents
const parents = computed(() => {
  return props.agent?.parents?.split("ET").map(p => p.trim()) || []
})

// Noms des parents formatés
const parentNames = computed(() => ({
  pere: parents.value[0] || "Non renseigné",
  mere: parents.value[1] || "Non renseigné"
}))

// Fonction utilitaire pour vérifier si un parent est en vie
const isAlive = (statut) => {
  if (!statut) return false
  const upperStatut = statut.toUpperCase()
  return upperStatut.includes("VIE") && !upperStatut.includes("DÉCÉDÉ")
}

// Informations complètes des parents
const parentsInfo = computed(() => {
  const pereStatut = statusParent.value.pere
  const mereStatut = statusParent.value.mere
  
  return {
    pere: {
      nom: parentNames.value.pere,
      statut: pereStatut,
      enVie: isAlive(pereStatut)
    },
    mere: {
      nom: parentNames.value.mere,
      statut: mereStatut,
      enVie: isAlive(mereStatut)
    }
  }
})

// Vérifications sur les parents
const hasLivingParent = computed(() => 
  parentsInfo.value.pere.enVie || parentsInfo.value.mere.enVie
)

const bothParentsDeceased = computed(() => {
  const pereDecede = parentsInfo.value.pere.statut?.toUpperCase().includes("DÉCÉDÉ") || false
  const mereDecede = parentsInfo.value.mere.statut?.toUpperCase().includes("DÉCÉDÉ") || false
  return pereDecede && mereDecede
})

// Couleur selon le statut
const getStatusColor = (enVie) => {
  if (enVie === true) return 'text-green-600'
  if (enVie === false) return 'text-red-600'
  return 'text-gray-500'
}
</script>

<template>
  <div class="bg-white shadow rounded p-4">
    <h3 class="font-bold mb-3">Situation familiale</h3>

    <p><b>Statut marital :</b> {{ agent.statut_marital }}</p>
    <p><b>Nombre enfants :</b> {{ agent.nbre_enfa }}</p>
    
    <p >
      <b>Nom enfants :</b>
      
    </p>
    <ul v-if="agent.nom_enfant?.length" class="px-5 mt-1">
        <li v-for="nom in agent.nom_enfant" :key="nom">
          {{ nom }}
        </li>
      </ul>

    <p v-if="agent.statut_marital !== 'Célibataire' && agent.nom_conjoint">
      <b>Conjoint :</b> {{ agent.nom_conjoint }}
    </p>

    <p><b>Parents :</b></p>
    <ul class="px-5">
      <li v-for="(p, index) in parents" :key="index">
        {{ p }}
        <span :class="getStatusColor(index === 0 ? parentsInfo.pere.enVie : parentsInfo.mere.enVie)">
          ({{ index === 0 ? parentsInfo.pere.statut : parentsInfo.mere.statut }})
        </span>
      </li>
    </ul>
  </div>
</template>