<script setup>
import { useRouter } from "vue-router"

const props = defineProps({
  person: Object,        // données (nom, enVie, statut…)
  type: String,          // 'pere' | 'mere' | 'enfant' | 'conjoint'
  roleLabel: String,     // "Père", "Mère", "Enfant"
  hasFiche: Boolean,     // si fiche existe
  agentId: [String, Number],
  personId: [String, Number] // id fiche si existe
})

const router = useRouter()

const goToDetail = () => {
  if (props.personId) {
    router.push({
      name: "PersonDetail",
      params: { id: props.personId }
    })
  }
}

const goToCreate = () => {
  router.push({
    name: "PersonCreate",
    query: {
      type: props.type,
      agent: props.agentId
    }
  })
}

const isVisible = () => {
  return props.person && props.person.enVie === true
}

const getStatusColor = (enVie) => {
  if (enVie === true) return 'text-green-600'
  if (enVie === false) return 'text-red-600'
  return 'text-gray-500'
}
</script>

<template>
  <div v-if="isVisible()" class="bg-gray-50 p-4 rounded-lg">
    
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2">
      <span class="text-sm font-semibold uppercase">{{ roleLabel }}</span>
      <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
        En vie
      </span>
    </div>

    <!-- Nom -->
    <p class="font-medium text-lg">
      {{ person.nom }}
    </p>

    <!-- Statut -->
    <p v-if="person.statut" 
       class="text-sm mt-2"
       :class="getStatusColor(person.enVie)">
      <span class="text-gray-500">Statut:</span> {{ person.statut }}
    </p>

    <!-- Actions -->
    <div class="flex gap-2 mt-3">
      <button
        v-if="hasFiche"
        @click="goToDetail"
        class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
      >
        Voir fiche
      </button>

      <button
        v-else
        @click="goToCreate"
        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
      >
        Créer fiche
      </button>
    </div>

  </div>
</template>