<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import LaboratoireForm from '@/modules/laboratoire/components/LaboratoireForm.vue'
import { useLaboratoireStore } from '@/modules/laboratoire/stores/laboratoire.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const router = useRouter()
const store = useLaboratoireStore()
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
    const created = await store.createExamen(workflowPayload)

    if (created?.id) {
      router.push(`/laboratoire/${created.id}`)
      return
    }

    router.push('/laboratoire')
  } catch (error) {
    console.error('[Laboratoire] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création de la demande laboratoire impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/laboratoire')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle demande laboratoire</h1>

      <p class="his-page-subtitle">Création d’une demande d’examen biologique.</p>
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

    <LaboratoireForm
      submit-label="Créer demande"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
