<script setup>

import { computed } from "vue"

const props = defineProps({
  agent: Object
})

const telephones = computed(() => {
  if (!props.agent.telephone) return []
  
  // Si la chaîne contient ";", on split par ";", sinon par ","
  const telephonesStr = props.agent.telephone
  return telephonesStr.includes(';') 
    ? telephonesStr.split(';') 
    : telephonesStr.includes(',') 
    ? telephonesStr.split(',')
    : telephonesStr.split('-')
})

</script>

<template>

  <div class="bg-white shadow rounded p-4">

    <h3 class="font-bold mb-3">
      Contact
    </h3>

    <ul>

      <li
        v-for="tel in telephones"
        :key="tel"
      >
        📞 {{ tel.trim() }}
      </li>

    </ul>

  </div>

</template>