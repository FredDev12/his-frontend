<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

import SortieForm from "@/modules/sorties/components/SortieForm.vue"
import { useSortiesStore } from "@/modules/sorties/stores/sorties.store"
import { useToastStore } from "@/shared/stores/toast.store"

const router = useRouter()
const store = useSortiesStore()
const toast = useToastStore()
const serverError = ref("")

async function submit(payload) {
  serverError.value = ""

  try {
    await store.createSortie(payload)
    router.push("/sorties")
  } catch (error) {
    serverError.value = error.response?.data?.message || error.message || "Création sortie impossible."
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push("/sorties")
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Créer une sortie patient</h1>
      <p class="his-page-subtitle">Action critique : clôture officielle de l’épisode.</p>
    </header>

    <div v-if="serverError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ serverError }}
    </div>

    <SortieForm :loading="store.saving" @submit="submit" @cancel="cancel" />
  </div>
</template>
