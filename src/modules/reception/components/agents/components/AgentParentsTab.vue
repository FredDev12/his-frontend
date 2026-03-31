<script setup>
import PersonCard from "../../../../persons/components/PersonCard.vue"

const props = defineProps({
  agent: Object,
  parents: Object
})


// Vérifie si le parent existe ET est en vie
const isParentVisible = (parent) => {
  console.log(parent);
  
  return parent && parent.enVie === true
}

</script>


<template>
  <div class="bg-white shadow rounded-lg p-5">
    <h3 class="font-bold text-lg mb-4 border-b pb-2">Parents</h3>

    <div class="grid grid-cols-2 gap-6 mb-4">
      
      <!-- Pere-->
      <PersonCard
        :person="parents?.pere"
        type="pere"
        roleLabel="Pere"
        :hasFiche="!!agent.pere_id"
        :personId="agent.pere_id"
        :agentId="agent?.id"
      />

      <!-- Mere-->
      <PersonCard
        :person="parents?.mere"
        type="mere"
        roleLabel="Mere"
        :hasFiche="!!agent.mere_id"
        :personId="agent.mere_id"
        :agentId="agent?.id"
      />

    </div>

    <!-- Message si aucun parent affichable -->
    <div v-if="!isParentVisible(parents?.pere) && !isParentVisible(parents?.mere)"
         class="text-gray-500 text-sm italic">
      Aucun parent en vie à afficher
    </div>

  </div>
</template>