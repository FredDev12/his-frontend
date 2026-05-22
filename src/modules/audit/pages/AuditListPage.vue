<script setup>
import { computed, onMounted } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import AuditSearchBar from '@/modules/audit/components/AuditSearchBar.vue'
import AuditTable from '@/modules/audit/components/AuditTable.vue'

import { useAuditStore } from '@/modules/audit/stores/audit.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useAuditStore()
const toast = useToastStore()

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 audit'
  return `${store.pagination.total} audit(s)`
})

onMounted(() => {
  loadAudits({ page: 1 })
})

async function loadAudits(params = {}) {
  try {
    await store.fetchAudits({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Audit] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les audits.')
  }
}

async function goToPage(page) {
  await loadAudits({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchAudits(filters)
  } catch (error) {
    console.error('[Audit] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche audit impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    action: '',
    entite: '',
    role: '',
  }

  await loadAudits({ page: 1 })
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Audit / Historique des actions</h1>

      <p class="his-page-subtitle">
        Consultation des actions sensibles, traçabilité utilisateur, IP, entité et changements.
      </p>
    </header>

    <BaseCard>
      <AuditSearchBar
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

      <AuditTable :audits="store.audits" :loading="store.loading" />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
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
  </div>
</template>
