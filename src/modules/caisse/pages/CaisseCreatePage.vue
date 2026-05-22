<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import CaisseForm from '@/modules/caisse/components/CaisseForm.vue'
import { useCaisseStore } from '@/modules/caisse/stores/caisse.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const router = useRouter()
const store = useCaisseStore()
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
    const created = await store.createPaiement(workflowPayload)

    if (created?.id) {
      router.push(`/caisse/${created.id}`)
      return
    }

    router.push('/caisse')
  } catch (error) {
    console.error('[Caisse] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création du paiement impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/caisse')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouveau paiement</h1>

      <p class="his-page-subtitle">Création d’un paiement hospitalier.</p>
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

    <CaisseForm
      submit-label="Créer paiement"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
