<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import ServiceForm from '@/modules/services/components/ServiceForm.vue'
import { useHospitalServicesStore } from '@/modules/services/stores/services.store'
import { useToastStore } from '@/shared/stores/toast.store'

const router = useRouter()
const store = useHospitalServicesStore()
const toast = useToastStore()

const serverError = ref('')

async function submit(payload) {
  serverError.value = ''

  try {
    const created = await store.createService(payload)

    if (created?.id) {
      router.push(`/services/${created.id}`)
      return
    }

    router.push('/services')
  } catch (error) {
    console.error('[Services] Erreur création:', error)

    serverError.value = error.message || 'Création du service impossible.'
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/services')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouveau service</h1>

      <p class="his-page-subtitle">Création d’un service hospitalier dans le référentiel.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <ServiceForm
      submit-label="Créer service"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
