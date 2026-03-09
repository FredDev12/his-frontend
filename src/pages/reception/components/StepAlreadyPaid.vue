<script setup>
import BaseButton from "../../../components/ui/BaseButton.vue"

const emit = defineEmits(["next", "back"])
</script>

<template>
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</span>
      <div>
        <p class="font-medium text-green-800">Fiche déjà payée</p>
        <p class="text-sm text-green-600">Vous pouvez passer directement au formulaire</p>
      </div>
    </div>
    <div class="flex justify-between items-center">
      <BaseButton variant="primary" @click="$emit('back')">⟵ Retour</BaseButton>
      <BaseButton variant="primary" @click="$emit('next')">
        Passer au formulaire →
      </BaseButton>
    </div>
  </div>
</template>