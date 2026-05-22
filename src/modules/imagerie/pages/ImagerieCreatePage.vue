<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ImagerieForm from '@/modules/imagerie/components/ImagerieForm.vue'
import { useImagerieStore } from '@/modules/imagerie/stores/imagerie.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const router = useRouter()
const store = useImagerieStore()
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
      router.push(`/imagerie/${created.id}`)
      return
    }

    router.push('/imagerie')
  } catch (error) {
    console.error('[Imagerie] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création de la demande d’imagerie impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/imagerie')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle demande d’imagerie</h1>

      <p class="his-page-subtitle">Création d’une demande d’examen technique ou radiologique.</p>
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

    <ImagerieForm
      submit-label="Créer demande"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
