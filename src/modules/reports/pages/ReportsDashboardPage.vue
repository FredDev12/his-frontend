<script setup>
import { onMounted } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import ReportsFilterBar from '@/modules/reports/components/ReportsFilterBar.vue'
import ReportsKpiGrid from '@/modules/reports/components/ReportsKpiGrid.vue'
import ReportsModuleTable from '@/modules/reports/components/ReportsModuleTable.vue'
import ReportsFinancialSummary from '@/modules/reports/components/ReportsFinancialSummary.vue'
import ReportsActivitySummary from '@/modules/reports/components/ReportsActivitySummary.vue'

import { useReportsStore } from '@/modules/reports/stores/reports.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useReportsStore()
const toast = useToastStore()

onMounted(() => {
  loadReports()
})

async function loadReports(filters = store.filters) {
  try {
    await store.fetchReports(filters)
  } catch (error) {
    console.error('[Reports] Chargement impossible:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les rapports.')
  }
}

async function applyFilters(filters) {
  await loadReports(filters)
}

async function resetFilters() {
  store.resetFilters()
  await loadReports(store.filters)
}

async function refresh() {
  await loadReports(store.filters)
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Rapports / Statistiques</h1>

        <p class="his-page-subtitle">
          Tableau de bord décisionnel : activité patient, examens, pharmacie, caisse et sorties.
        </p>
      </div>

      <BaseButton variant="secondary" :loading="store.loading" @click="refresh">
        Recharger
      </BaseButton>
    </header>

    <BaseCard>
      <ReportsFilterBar
        :filters="store.filters"
        :loading="store.loading"
        @apply="applyFilters"
        @reset="resetFilters"
      />
    </BaseCard>

    <div
      v-if="Object.keys(store.errors || {}).length"
      class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Certains modules n’ont pas pu être chargés. Les statistiques affichées peuvent être
      partielles.
    </div>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement des rapports et statistiques...
    </div>

    <template v-else-if="store.report">
      <ReportsKpiGrid :report="store.report" />

      <ReportsActivitySummary :report="store.report" />

      <ReportsFinancialSummary :finance="store.report.finance" />

      <BaseCard
        title="Statistiques par module"
        subtitle="Vue comparative des principaux modules du HIS."
      >
        <ReportsModuleTable :modules="store.report.modules" />
      </BaseCard>
    </template>
  </div>
</template>
