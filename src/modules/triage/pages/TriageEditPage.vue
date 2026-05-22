<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TriageForm from '@/modules/triage/components/TriageForm.vue'
import { useTriageStore } from '@/modules/triage/stores/triage.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useTriageStore()
const toast = useToastStore()

const serverError = ref('')

const triageId = computed(() => route.params.id)
const triage = computed(() => store.selectedTriage)

onMounted(async () => {
  try {
    await store.fetchTriageById(triageId.value)
  } catch {
    router.push('/triage')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateTriage(triageId.value, payload)
    router.push(`/triage/${triageId.value}`)
  } catch (error) {
    console.error('[Triage] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification du triage impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/triage/${triageId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier triage</h1>

      <p class="his-page-subtitle">Modification contrôlée des signes vitaux et de l’orientation.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du triage...
    </div>

    <TriageForm
      v-else-if="triage"
      :initial-value="triage"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
