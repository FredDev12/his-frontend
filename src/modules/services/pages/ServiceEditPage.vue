<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ServiceForm from '@/modules/services/components/ServiceForm.vue'
import { useHospitalServicesStore } from '@/modules/services/stores/services.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useHospitalServicesStore()
const toast = useToastStore()

const serverError = ref('')

const serviceId = computed(() => route.params.id)
const service = computed(() => store.selectedService)

onMounted(async () => {
  try {
    await store.fetchServiceById(serviceId.value)
  } catch {
    router.push('/services')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateService(serviceId.value, payload)
    router.push(`/services/${serviceId.value}`)
  } catch (error) {
    console.error('[Services] Erreur modification:', error)

    serverError.value = error.message || 'Modification du service impossible.'
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/services/${serviceId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier service</h1>

      <p class="his-page-subtitle">
        Modification contrôlée du référentiel des services hospitaliers.
      </p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du service...
    </div>

    <ServiceForm
      v-else-if="service"
      :initial-value="service"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
