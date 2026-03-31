<script setup>

import AgentCard from "./AgentCard.vue"
import AgentSearchBar from "./AgentSearchBar.vue";

const props = defineProps({
  agents: {
    type: Array,
    default: () => []
  },
  type: String
})

const emit = defineEmits(["select"])

</script>

<template>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AgentCard
          v-for="agent in agents"
          :key="agent.cac_id_co"
          :agent="agent"
          @select="emit('select', $event)"
      />
    </div>

</template>