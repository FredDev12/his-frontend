<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import PharmacieForm from '@/modules/pharmacie/components/PharmacieForm.vue'
import { usePharmacieStore } from '@/modules/pharmacie/stores/pharmacie.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const router = useRouter()
const store = usePharmacieStore()
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
    const created = await store.createPrescription(workflowPayload)

    if (created?.id) {
      router.push(`/pharmacie/${created.id}`)
      return
    }

    router.push('/pharmacie')
  } catch (error) {
    console.error('[Pharmacie] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création de la prescription impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/pharmacie')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle prescription</h1>

      <p class="his-page-subtitle">
        Création d’une prescription médicale pour délivrance pharmacie.
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

    <PharmacieForm
      submit-label="Créer prescription"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
