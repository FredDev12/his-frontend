<!-- src/components/workflow/StepReception.vue-->

<script setup>
import { reactive } from 'vue';

const emit = defineEmits(["next"])


function select(type) {
  emit("next", type)
}
</script>

<template>
  <div class="grid grid-cols-2 gap-6">
    <div @click="select('PUBLIC')" class="card cursor-pointer">
      Patient Public
    </div>

    <div @click="select('AGENT')" class="card cursor-pointer">
      Agent CAC
    </div>
  </div>
</template>