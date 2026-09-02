<script setup>
import { computed, onMounted } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import ImagerieSearchBar from '@/modules/imagerie/components/ImagerieSearchBar.vue'
import ImagerieTable from '@/modules/imagerie/components/ImagerieTable.vue'

import { useImagerieStore } from '@/modules/imagerie/stores/imagerie.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useImagerieStore()
const toast = useToastStore()

const totalLabel = computed(() => {
  if (!store.pagination.total) {
    return '0 examen'
  }

  return `${store.pagination.total} examen(s)`
})

onMounted(() => {
  loadExamens({ page: 1 })
})

async function loadExamens(params = {}) {
  try {
    await store.fetchExamens({
      page: params.page || 1,
      limit:
        params.limit ||
        params.limite ||
        store.pagination.limite,
    })
  } catch (error) {
    console.error(
      '[Imagerie] Erreur chargement:',
      error,
    )

    toast.error(
      error?.message ||
        'Impossible de charger les examens d’imagerie.',
    )
  }
}

async function goToPage(page) {
  await loadExamens({
    page,
    limit: store.pagination.limite,
  })
}

async function search(filters) {
  try {
    await store.searchExamens(filters)
  } catch (error) {
    console.error(
      '[Imagerie] Erreur recherche:',
      error,
    )

    toast.error(
      error?.message ||
        'Recherche imagerie impossible.',
    )
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
    type: '',
  }

  await loadExamens({ page: 1 })
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">
        Imagerie
      </h1>

      <p class="his-page-subtitle">
        Radiologie, échographie, scanner et IRM demandés depuis les consultations.
      </p>
    </header>

    <BaseCard>
      <ImagerieSearchBar
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

      <ImagerieTable
        :examens="store.examens"
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
            :disabled="
              store.loading ||
              store.pagination.page <= 1
            "
            @click="
              goToPage(
                store.pagination.page - 1
              )
            "
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="
              store.loading ||
              !store.pagination.hasNext
            "
            @click="
              goToPage(
                store.pagination.page + 1
              )
            "
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
