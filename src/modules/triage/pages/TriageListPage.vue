<script setup>
import { computed, onMounted, ref } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'

import TriageQueueTable from '@/modules/triage/components/TriageQueueTable.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useTriageStore } from '@/modules/triage/stores/triage.store'
import { useToastStore } from '@/shared/stores/toast.store'

const auth = useAuthStore()
const store = useTriageStore()
const toast = useToastStore()

const q = ref('')

const totalLabel = computed(() => {
  const total = store.queuePagination.total
  return `${total} patient${total > 1 ? 's' : ''} en attente`
})

onMounted(() => {
  loadQueue({ page: 1 })
})

async function loadQueue(params = {}) {
  try {
    await store.fetchQueue({
      q: params.q ?? store.queueFilters.q,
      page: params.page || 1,
      limit: store.queuePagination.limit,
    })
  } catch (error) {
    toast.error(error.message || 'Impossible de charger la file du triage.')
  }
}

async function search() {
  await loadQueue({
    q: q.value.trim(),
    page: 1,
  })
}

async function reset() {
  q.value = ''
  await loadQueue({
    q: '',
    page: 1,
  })
}

async function goToPage(page) {
  await loadQueue({
    page,
    q: store.queueFilters.q,
  })
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">File d’attente Triage</h1>

        <p class="his-page-subtitle">
          Patients admis par la Réception et en attente d’une évaluation infirmière.
        </p>
      </div>

      <BaseButton
        variant="secondary"
        :loading="store.queueLoading"
        @click="loadQueue({ page: store.queuePagination.page })"
      >
        Actualiser la file
      </BaseButton>
    </header>

    <BaseCard>
      <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="search">
        <BaseInput
          v-model="q"
          class="flex-1"
          label="Rechercher dans la file"
          placeholder="Nom, code patient, réception ou épisode"
        />

        <div class="flex items-end gap-2">
          <BaseButton type="submit" :loading="store.queueLoading">
            Rechercher
          </BaseButton>
          <BaseButton type="button" variant="secondary" @click="reset">
            Réinitialiser
          </BaseButton>
        </div>
      </form>
    </BaseCard>

    <div
      v-if="store.queueError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.queueError }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <TriageQueueTable
        :items="store.queue"
        :loading="store.queueLoading"
        :can-start="auth.hasPermission('triage:create')"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.queuePagination.page }} ·
          {{ store.queuePagination.limit }} éléments maximum
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.queueLoading || !store.queuePagination.hasPrev"
            @click="goToPage(store.queuePagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.queueLoading || !store.queuePagination.hasNext"
            @click="goToPage(store.queuePagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
