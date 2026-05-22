<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ImagerieForm from '@/modules/imagerie/components/ImagerieForm.vue'
import { useImagerieStore } from '@/modules/imagerie/stores/imagerie.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useImagerieStore()
const toast = useToastStore()

const serverError = ref('')

const examenId = computed(() => route.params.id)
const examen = computed(() => store.selectedExamen)

onMounted(async () => {
  try {
    await store.fetchExamenById(examenId.value)
  } catch {
    router.push('/imagerie')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateExamen(examenId.value, payload)
    router.push(`/imagerie/${examenId.value}`)
  } catch (error) {
    console.error('[Imagerie] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification de l’examen d’imagerie impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/imagerie/${examenId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier examen d’imagerie</h1>

      <p class="his-page-subtitle">
        Modification contrôlée de la demande et du compte rendu d’imagerie.
      </p>
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

    <ImagerieForm
      v-else-if="examen"
      :initial-value="examen"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
