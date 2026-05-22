<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import SortieForm from '@/modules/sorties/components/SortieForm.vue'
import { useSortiesStore } from '@/modules/sorties/stores/sorties.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useSortiesStore()
const toast = useToastStore()

const serverError = ref('')

const sortieId = computed(() => route.params.id)
const sortie = computed(() => store.selectedSortie)

onMounted(async () => {
  try {
    await store.fetchSortieById(sortieId.value)
  } catch {
    router.push('/sorties')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateSortie(sortieId.value, payload)
    router.push(`/sorties/${sortieId.value}`)
  } catch (error) {
    console.error('[Sorties] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification de la sortie impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/sorties/${sortieId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier sortie patient</h1>

      <p class="his-page-subtitle">
        Modification contrôlée du résumé médical et des consignes de sortie.
      </p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la sortie...
    </div>

    <SortieForm
      v-else-if="sortie"
      :initial-value="sortie"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
