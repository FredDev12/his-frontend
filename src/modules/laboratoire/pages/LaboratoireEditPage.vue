<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import LaboratoireForm from '@/modules/laboratoire/components/LaboratoireForm.vue'
import { useLaboratoireStore } from '@/modules/laboratoire/stores/laboratoire.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useLaboratoireStore()
const toast = useToastStore()

const serverError = ref('')

const examenId = computed(() => route.params.id)
const examen = computed(() => store.selectedExamen)

onMounted(async () => {
  try {
    await store.fetchExamenById(examenId.value)
  } catch {
    router.push('/laboratoire')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateExamen(examenId.value, payload)
    router.push(`/laboratoire/${examenId.value}`)
  } catch (error) {
    console.error('[Laboratoire] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification de l’examen impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/laboratoire/${examenId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier examen laboratoire</h1>

      <p class="his-page-subtitle">Modification contrôlée des examens et résultats.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de l’examen...
    </div>

    <LaboratoireForm
      v-else-if="examen"
      :initial-value="examen"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
