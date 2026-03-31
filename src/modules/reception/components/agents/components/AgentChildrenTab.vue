<script setup>
import PersonCard from "../../../../persons/components/PersonCard.vue"
import { computed } from "vue"

const props = defineProps({
  agent:Object
})

/**
 * Génération safe des enfants
 */
const children = computed(() => {
  const n = parseInt(props.agent.nbre_enfa || 0)

  // si backend un jour envoie vraie liste
  if (Array.isArray(props.agent.nom_enfant)) {
    return props.agent.nom_enfant
  }

  // fallback (cas actuel chez toi)
  if (n > 0) {
    return Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      nom: `Enfant ${i + 1}`,
      prenom: "",
      enVie: true,
      fiche_id: null
    }))
  }

  return []
})

</script>

<template>

    <div class="bg-white shadow rounded p-4">

        <h3 class="font-bold text-lg mb-4 border-b pb-2">Enfants</h3>
        <p>
            <b>nombre d'enfants : </b> {{ agent.nbre_enfa || 0 }}
        </p>

        <div v-if="children.length" 
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <PersonCard
                v-for="child in children"
                :key="child.id"
                :person="child"
                type="enfant"
                roleLabel="Enfant"
                :hasFiche="!!child.fiche_id"
                :personId="child.fiche_id"
                :agentId="agent.id"
            />
        </div>

        <!-- Aucun enfant -->
        <div v-else class="text-gray-500 text-sm italic">
        Aucun enfant enregistré
        </div>

    </div>

</template>