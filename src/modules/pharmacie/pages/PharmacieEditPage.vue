<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PharmacieForm from '@/modules/pharmacie/components/PharmacieForm.vue'
import { usePharmacieStore } from '@/modules/pharmacie/stores/pharmacie.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = usePharmacieStore()
const toast = useToastStore()

const serverError = ref('')

const prescriptionId = computed(() => route.params.id)
const prescription = computed(() => store.selectedPrescription)

onMounted(async () => {
  try {
    await store.fetchPrescriptionById(prescriptionId.value)
  } catch {
    router.push('/pharmacie')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updatePrescription(prescriptionId.value, payload)
    router.push(`/pharmacie/${prescriptionId.value}`)
  } catch (error) {
    console.error('[Pharmacie] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification de la prescription impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/pharmacie/${prescriptionId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier prescription</h1>

      <p class="his-page-subtitle">Modification contrôlée des médicaments prescrits.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la prescription...
    </div>

    <PharmacieForm
      v-else-if="prescription"
      :initial-value="prescription"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
