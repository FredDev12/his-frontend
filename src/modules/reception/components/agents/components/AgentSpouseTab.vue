<script setup>
import { computed } from "vue"
import PersonCard from "../../../../persons/components/PersonCard.vue"

const props = defineProps({
  agent: Object
})

const conjoint = computed(() => {
  if (!props.agent) return null

  return {
    id: props.agent.conjoint_id,
    nom: props.agent.nom_conjoint,
    enVie: true // ou API si dispo
  }
})
</script>

<template>
  <div class="bg-white shadow rounded p-4">

    <h3 class="font-bold mb-3">Conjoint</h3>

    <!-- Aucun conjoint -->
    <div v-if="!agent?.nom_conjoint" class="text-gray-500 text-sm italic">
      Aucun conjoint enregistré
    </div>

    <!-- Conjoint existant -->
    <PersonCard
      v-else
      :person="conjoint"
      type="conjoint"
      roleLabel="Conjoint"
      :hasFiche="!!agent.conjoint_id"
      :personId="agent.conjoint_id"
      :agentId="agent.id"
    />

  </div>
</template>