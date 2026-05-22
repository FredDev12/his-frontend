<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ConsultationForm from '@/modules/consultations/components/ConsultationForm.vue'
import { useConsultationsStore } from '@/modules/consultations/stores/consultations.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const router = useRouter()
const store = useConsultationsStore()
const toast = useToastStore()

const serverError = ref('')

const ficheContext = ref(null)

onMounted(() => {
  ficheContext.value = ficheWorkflowService.getActiveFiche()
})

async function submit(payload) {
  serverError.value = ''

  try {
    const workflowPayload = ficheWorkflowService.buildWorkflowPayload(payload, ficheContext.value)
    const created = await store.createConsultation(workflowPayload)

    if (created?.id) {
      router.push(`/consultations/${created.id}`)
      return
    }

    router.push('/consultations')
  } catch (error) {
    console.error('[Consultations] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création de la consultation impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/consultations')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle consultation</h1>

      <p class="his-page-subtitle">Création d’une consultation médicale complète.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>
    <FicheContextCard
      v-if="ficheContext"
      :context="ficheContext"
      title="Fiche utilisée pour cette opération"
    />

    <ConsultationForm
      submit-label="Créer consultation"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
