<script setup>

import { computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useAgentStore } from "../stores/agents.store"

import AgentProfileCard from "../components/AgentProfileCard.vue"
import AgentPersonalInfo from "../components/AgentPersonalInfo.vue"
import AgentProfessionalInfo from "../components/AgentProfessionalInfo.vue"
import AgentContactInfo from "../components/AgentContactInfo.vue"
import AgentFamilyInfo from "../components/AgentFamilyInfo.vue"
import AgentTabs from "../components/AgentTabs.vue"

const route = useRoute()
const agentStore = useAgentStore()

const agentId = route.params.id

onMounted(async () => {
  await agentStore.searchAgentsByCAC(agentId)
})

const agent = computed(() => agentStore?.agent || [])

</script>

<template>

    <div class="max-w-l mx-auto p-6">

        <button
            @click="$router.push({path:'/reception', query:{ reset: 'true'}})"
            class="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
            Retour
        </button>

         <!-- Loading state (optionnel) -->
        <div v-if="!agent" class="text-center py-8">
            Chargement...
        </div>

        <div v-if="agent">

            <AgentProfileCard :agent="agent" />

            <div class="grid grid-coles-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">

                <AgentPersonalInfo :agent="agent" />

                <AgentProfessionalInfo :agent="agent" />

                <AgentContactInfo :agent="agent" />

                <AgentFamilyInfo :agent="agent" />

            </div>

            <div class="py-4">
                <AgentTabs :agent="agent"/>
            </div>

        </div>

    </div>

</template>