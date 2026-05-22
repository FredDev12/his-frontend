<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import RendezVousForm from '@/modules/rendez-vous/components/RendezVousForm.vue'
import { useRendezVousStore } from '@/modules/rendez-vous/stores/rendezvous.store'
import { useToastStore } from '@/shared/stores/toast.store'

const router = useRouter()
const store = useRendezVousStore()
const toast = useToastStore()

const serverError = ref('')

async function submit(payload) {
  serverError.value = ''

  try {
    const created = await store.createRendezVous(payload)

    if (created?.id) {
      router.push(`/rendez-vous/${created.id}`)
      return
    }

    router.push('/rendez-vous')
  } catch (error) {
    serverError.value = error.message || 'Création du rendez-vous impossible.'
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/rendez-vous')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouveau rendez-vous</h1>

      <p class="his-page-subtitle">Planifier un passage patient vers un service hospitalier.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <RendezVousForm
      submit-label="Créer rendez-vous"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
