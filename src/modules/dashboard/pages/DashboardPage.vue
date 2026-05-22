<script setup>
import { onMounted } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'

import DashboardStatCard from '@/modules/dashboard/components/DashboardStatCard.vue'
import DashboardQuickActions from '@/modules/dashboard/components/DashboardQuickActions.vue'
import DashboardRecentActivity from '@/modules/dashboard/components/DashboardRecentActivity.vue'
import DashboardOperationalStatus from '@/modules/dashboard/components/DashboardOperationalStatus.vue'
import DashboardNotificationsPanel from '@/modules/dashboard/components/DashboardNotificationsPanel.vue'

import { useDashboardStore } from '@/modules/dashboard/stores/dashboard.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { formatDateTime } from '@/shared/utils/date'

const store = useDashboardStore()
const toast = useToastStore()

onMounted(() => {
  loadDashboard()
})

async function loadDashboard() {
  try {
    await store.fetchDashboard()
  } catch (error) {
    console.error('[Dashboard] Chargement impossible:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger le dashboard.')
  }
}

function formatMoney(value, devise) {
  const amount = Number(value || 0)

  return `${amount.toLocaleString('fr-FR')} ${devise || 'CDF'}`
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Tableau de bord</h1>

        <p class="his-page-subtitle">
          Vue synthèse du HIS : patients, admissions, urgences, paiements, sorties et notifications.
        </p>

        <p v-if="store.dashboard" class="mt-2 text-sm text-slate-400">
          Dernière actualisation : {{ formatDateTime(store.dashboard.generated_at) }}
        </p>
      </div>

      <BaseButton variant="secondary" :loading="store.loading" @click="loadDashboard">
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
      Chargement du tableau de bord...
    </div>

    <template v-else-if="store.dashboard">
      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Patients"
          :value="store.dashboard.kpis.patients"
          subtitle="Patients enregistrés"
          tone="primary"
        />

        <DashboardStatCard
          title="Réceptions du jour"
          :value="store.dashboard.kpis.receptionsToday"
          subtitle="Admissions aujourd’hui"
          tone="success"
        />

        <DashboardStatCard
          title="Consultations du jour"
          :value="store.dashboard.kpis.consultationsToday"
          subtitle="Consultations enregistrées"
          tone="primary"
        />

        <DashboardStatCard
          title="Urgences triage"
          :value="store.dashboard.kpis.urgentTriage"
          subtitle="Cas urgents détectés"
          tone="danger"
        />

        <DashboardStatCard
          title="Paiements du jour"
          :value="store.dashboard.kpis.paiementsToday"
          subtitle="Transactions caisse"
          tone="success"
        />

        <DashboardStatCard
          title="Recettes du jour"
          :value="
            formatMoney(store.dashboard.kpis.totalPaiementsToday, store.dashboard.kpis.devise)
          "
          subtitle="Montant encaissé aujourd’hui"
          tone="success"
        />

        <DashboardStatCard
          title="Sorties du jour"
          :value="store.dashboard.kpis.sortiesToday"
          subtitle="Patients clôturés"
          tone="warning"
        />

        <DashboardStatCard
          title="Notifications non lues"
          :value="store.dashboard.kpis.unreadNotifications"
          subtitle="Événements à consulter"
          tone="warning"
        />
      </section>

      <DashboardQuickActions />

      <section class="grid gap-6 xl:grid-cols-2">
        <DashboardOperationalStatus
          :alerts="store.dashboard.alerts"
          :has-partial-errors="store.dashboard.technical.hasPartialErrors"
        />

        <DashboardNotificationsPanel :notifications="store.dashboard.latestNotifications" />
      </section>

      <DashboardRecentActivity :activities="store.dashboard.recentActivity" />
    </template>
  </div>
</template>
