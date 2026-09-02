<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import ConsultationSearchBar from '@/modules/consultations/components/ConsultationSearchBar.vue'
import ConsultationTable from '@/modules/consultations/components/ConsultationTable.vue'

import { useConsultationsStore } from '@/modules/consultations/stores/consultations.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useConsultationsStore()
const toast = useToastStore()

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 consultation'
  return `${store.pagination.total} consultation(s)`
})

onMounted(() => {
  loadConsultations({ page: 1 })
})

async function loadConsultations(params = {}) {
  try {
    await store.fetchConsultations({
      page: params.page || 1,
      limit:
        params.limit ||
        params.limite ||
        store.pagination.limite,
    })
  } catch (error) {
    console.error(
      '[Consultations] Erreur chargement:',
      error,
    )
    toast.error(
      error?.message ||
        'Impossible de charger les consultations.',
    )
  }
}

async function goToPage(page) {
  await loadConsultations({
    page,
    limit: store.pagination.limite,
  })
}

async function search(filters) {
  try {
    await store.searchConsultations(filters)
  } catch (error) {
    console.error(
      '[Consultations] Erreur recherche:',
      error,
    )
    toast.error(
      error?.message ||
        'Recherche consultation impossible.',
    )
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    service: '',
    statut: '',
  }

  await loadConsultations({ page: 1 })
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Historique des consultations</h1>

        <p class="his-page-subtitle">
          Consultations enregistrées et consultables en lecture seule.
        </p>
      </div>

      <RouterLink to="/consultations/dashboard">
        <BaseButton>
          Ouvrir la file médicale
        </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <ConsultationSearchBar
        :filters="store.filters"
        :loading="store.searching"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <ConsultationTable
        :consultations="store.consultations"
        :loading="store.loading"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} ·
          Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || store.pagination.page <= 1"
            @click="goToPage(store.pagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasNext"
            @click="goToPage(store.pagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      Les consultations validées ne sont ni modifiées ni supprimées depuis cette liste.
    </div>
  </div>
</template>
