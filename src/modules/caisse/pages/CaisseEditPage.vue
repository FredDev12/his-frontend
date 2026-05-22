<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CaisseForm from '@/modules/caisse/components/CaisseForm.vue'
import { useCaisseStore } from '@/modules/caisse/stores/caisse.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useCaisseStore()
const toast = useToastStore()

const serverError = ref('')

const paiementId = computed(() => route.params.id)
const paiement = computed(() => store.selectedPaiement)

onMounted(async () => {
  try {
    await store.fetchPaiementById(paiementId.value)
  } catch {
    router.push('/caisse')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updatePaiement(paiementId.value, payload)
    router.push(`/caisse/${paiementId.value}`)
  } catch (error) {
    console.error('[Caisse] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification du paiement impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/caisse/${paiementId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier paiement</h1>

      <p class="his-page-subtitle">Modification contrôlée d’un paiement caisse.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du paiement...
    </div>

    <CaisseForm
      v-else-if="paiement"
      :initial-value="paiement"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
