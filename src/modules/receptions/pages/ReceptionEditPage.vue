<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ReceptionForm from '@/modules/receptions/components/ReceptionForm.vue'
import { useReceptionsStore } from '@/modules/receptions/stores/receptions.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useReceptionsStore()
const toast = useToastStore()

const serverError = ref('')

const receptionId = computed(() => route.params.id)
const reception = computed(() => store.selectedReception)

onMounted(async () => {
  try {
    await store.fetchReceptionById(receptionId.value)
  } catch {
    router.push('/receptions')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateReception(receptionId.value, payload)
    router.push(`/receptions/${receptionId.value}`)
  } catch (error) {
    console.error('[Réceptions] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification de la réception impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/receptions/${receptionId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier réception</h1>

      <p class="his-page-subtitle">Modification contrôlée des informations d’admission.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la réception...
    </div>

    <ReceptionForm
      v-else-if="reception"
      :initial-value="reception"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
