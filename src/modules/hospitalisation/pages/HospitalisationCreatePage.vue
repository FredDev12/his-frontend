<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

import HospitalisationForm from "@/modules/hospitalisation/components/HospitalisationForm.vue"
import { useHospitalisationStore } from "@/modules/hospitalisation/stores/hospitalisation.store"
import { useToastStore } from "@/shared/stores/toast.store"

const router = useRouter()
const store = useHospitalisationStore()
const toast = useToastStore()

const serverError = ref("")

async function submit(payload) {
  serverError.value = ""

  try {
    const created = await store.createHospitalisation(payload)
    if (created?.id) {
      router.push("/hospitalisation")
      return
    }

    router.push("/hospitalisation")
  } catch (error) {
    serverError.value = error.response?.data?.message || error.message || "Création hospitalisation impossible."
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push("/hospitalisation")
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle hospitalisation</h1>
      <p class="his-page-subtitle">Admission contrôlée d’un patient en hospitalisation.</p>
    </header>

    <div v-if="serverError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ serverError }}
    </div>

    <HospitalisationForm
      submit-label="Créer hospitalisation"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
