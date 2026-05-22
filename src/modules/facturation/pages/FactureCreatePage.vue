<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import FactureForm from '@/modules/facturation/components/FactureForm.vue'
import { useFacturationStore } from '@/modules/facturation/stores/facturation.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const router = useRouter()
const store = useFacturationStore()
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
    const created = await store.createFacture(workflowPayload)

    if (created?.id) {
      router.push(`/facturation/${created.id}`)
      return
    }

    router.push('/facturation')
  } catch (error) {
    serverError.value = error.message || 'Création facture impossible.'
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/facturation')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle facture</h1>
      <p class="his-page-subtitle">Créer une facture avec lignes et total calculé.</p>
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

    <FactureForm
      submit-label="Créer facture"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
