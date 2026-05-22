<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'

import FicheContextCard from '@/shared/components/FicheContextCard.vue'
import TriageForm from '@/modules/triage/components/TriageForm.vue'
import { useTriageStore } from '@/modules/triage/stores/triage.store'
import { useToastStore } from '@/shared/stores/toast.store'

const router = useRouter()
const store = useTriageStore()
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

    const created = await store.createTriage(workflowPayload)

    if (created?.id) {
      router.push(`/triage/${created.id}`)
      return
    }

    router.push('/triage')
  } catch (error) {
    console.error('[Triage] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création du triage impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/triage')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouveau triage</h1>

      <p class="his-page-subtitle">
        Enregistrement des signes vitaux, priorité et orientation du patient.
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
      title="Fiche utilisée pour ce triage"
    />

    <TriageForm
      submit-label="Créer triage"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
