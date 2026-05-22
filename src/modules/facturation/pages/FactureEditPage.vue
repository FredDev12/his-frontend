<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import FactureForm from '@/modules/facturation/components/FactureForm.vue'
import { useFacturationStore } from '@/modules/facturation/stores/facturation.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useFacturationStore()
const toast = useToastStore()

const serverError = ref('')
const factureId = computed(() => route.params.id)
const facture = computed(() => store.selectedFacture)

onMounted(async () => {
  try {
    await store.fetchFactureById(factureId.value)
  } catch {
    router.push('/facturation')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateFacture(factureId.value, payload)
    router.push(`/facturation/${factureId.value}`)
  } catch (error) {
    serverError.value = error.message || 'Modification facture impossible.'
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/facturation/${factureId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier facture</h1>
      <p class="his-page-subtitle">Modification contrôlée d’une facture brouillon.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la facture...
    </div>

    <FactureForm
      v-else-if="facture"
      :initial-value="facture"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
