<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConsultationForm from '@/modules/consultations/components/ConsultationForm.vue'
import { useConsultationsStore } from '@/modules/consultations/stores/consultations.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useConsultationsStore()
const toast = useToastStore()

const serverError = ref('')

const consultationId = computed(() => route.params.id)
const consultation = computed(() => store.selectedConsultation)

onMounted(async () => {
  try {
    await store.fetchConsultationById(consultationId.value)
  } catch {
    router.push('/consultations')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateConsultation(consultationId.value, payload)
    router.push(`/consultations/${consultationId.value}`)
  } catch (error) {
    console.error('[Consultations] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification de la consultation impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/consultations/${consultationId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier consultation</h1>

      <p class="his-page-subtitle">Modification contrôlée des données médicales.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la consultation...
    </div>

    <ConsultationForm
      v-else-if="consultation"
      :initial-value="consultation"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
