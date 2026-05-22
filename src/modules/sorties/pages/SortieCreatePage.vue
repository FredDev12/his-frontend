<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import SortieForm from '@/modules/sorties/components/SortieForm.vue'
import { useSortiesStore } from '@/modules/sorties/stores/sorties.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import FicheContextCard from '@/shared/components/FicheContextCard.vue'

const router = useRouter()
const store = useSortiesStore()
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
    const created = await store.createSortie(workflowPayload)

    if (created?.id) {
      router.push(`/sorties/${created.id}`)
      return
    }

    router.push('/sorties')
  } catch (error) {
    console.error('[Sorties] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création de la sortie impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/sorties')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvelle sortie patient</h1>

      <p class="his-page-subtitle">
        Création d’une sortie avec résumé médical et consignes finales.
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

    <SortieForm
      submit-label="Créer sortie"
      :prefill-context="ficheContext"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
