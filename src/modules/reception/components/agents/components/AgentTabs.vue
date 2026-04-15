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


const hasSpouse = computed(() => {
  if (!props.agent?.statut_marital) return false
  
  return props.agent.statut_marital.toLowerCase() !== "célibataire"
})

const hasChild = computed(() => {
  return Number(props.agent?.nbre_enfa ?? 0) > 0
})


</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-4">
      Dossier Médical
    </h2>

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

      <AgentChildrenTab
        v-if="activeTab === 'enfants'"
        :agent="agent"
      />
    </div>
  </div>
</template>