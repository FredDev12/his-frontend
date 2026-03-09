<script setup>
import BaseButton from "../../../components/ui/BaseButton.vue"
import { useRouter } from "vue-router"

const router = useRouter()
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Réception</h1>
      <p class="text-gray-600 mt-1">Admission et enregistrement des patients</p>
    </div>
    
    <BaseButton
      variant="secondary"
      @click="router.push({ name: 'fiches.list' })"
      class="w-full md:w-auto"
    >
      📋 Voir toutes les fiches
    </BaseButton>
  </div>
</template>