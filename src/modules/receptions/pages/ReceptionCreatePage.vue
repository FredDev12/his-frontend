<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ReceptionForm from '@/modules/receptions/components/ReceptionForm.vue'
import { useReceptionsStore } from '@/modules/receptions/stores/receptions.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const route = useRoute()
const router = useRouter()
const store = useReceptionsStore()
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
    const created = await store.createReception(workflowPayload)
    if (created?.id) {
      router.push(`/receptions/${created.id}`)
      return
    }

    router.push('/receptions')
  } catch (error) {
    console.error('[Réceptions] Erreur création:', error)
    console.error('[Réceptions] Réponse backend:', error.response?.data)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      JSON.stringify(error.response?.data?.details || error.response?.data?.errors || '') ||
      'Création de la réception impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  const patientId = route.query.patientId

  if (patientId) {
    router.push(`/patients/${patientId}`)
    return
  }

  router.push('/receptions')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle réception</h1>

      <p class="his-page-subtitle">
        Création d’une admission patient avec service d’orientation et paiement initial.
      </p>
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

    <ReceptionForm
      submit-label="Créer réception"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
