<script setup>
import { onMounted } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'

import AdministrationSummaryCards from '@/modules/administration/components/AdministrationSummaryCards.vue'
import AdministrationQuickLinks from '@/modules/administration/components/AdministrationQuickLinks.vue'
import AdministrationAlertsPanel from '@/modules/administration/components/AdministrationAlertsPanel.vue'
import AdministrationModulesTable from '@/modules/administration/components/AdministrationModulesTable.vue'
import AdministrationStoragePanel from '@/modules/administration/components/AdministrationStoragePanel.vue'
import AdministrationApiTester from '@/modules/administration/components/AdministrationApiTester.vue'

import { useAdministrationStore } from '@/modules/administration/stores/administration.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { formatDateTime } from '@/shared/utils/date'

const store = useAdministrationStore()
const toast = useToastStore()

onMounted(() => {
  loadAdministration()
})

async function loadAdministration() {
  try {
    await store.fetchAdministration()
  } catch (error) {
    console.error('[Administration] Chargement impossible:', error)
    toast.error(error.message || 'Impossible de charger la console administration.')
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Administration</h1>

        <p class="his-page-subtitle">
          Console centrale de supervision : modules, référentiels, alertes et accès administratifs.
        </p>

        <p v-if="store.generated_at" class="mt-2 text-sm text-slate-400">
          Dernière vérification : {{ formatDateTime(store.generated_at) }}
        </p>
      </div>

      <BaseButton variant="secondary" :loading="store.loading" @click="loadAdministration">
        Actualiser
      </BaseButton>
    </header>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la console administration...
    </div>

    <template v-else>
      <AdministrationSummaryCards :store="store" />

      <AdministrationAlertsPanel :alerts="store.alerts" />

      <AdministrationQuickLinks />

      <AdministrationApiTester />

      <AdministrationStoragePanel :modules="store.localModules" />

      <AdministrationModulesTable
        title="Modules API"
        subtitle="État des modules connectés au backend."
        :modules="store.apiModules"
      />

      <AdministrationModulesTable
        title="Modules localStorage"
        subtitle="Référentiels frontend temporaires."
        :modules="store.localModules"
      />
    </template>
  </div>
</template>
