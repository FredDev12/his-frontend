<script setup>
import { onMounted, onUnmounted, ref } from "vue"

import { useClinicalDashboardStore } from "@/modules/clinical-dashboard/stores/clinical-dashboard.store"
import { notificationsService } from "@/modules/notifications/services/notifications.service"

import AlertsGrid from "@/modules/clinical-dashboard/components/AlertsGrid.vue"
import OccupancyGrid from "@/modules/clinical-dashboard/components/OccupancyGrid.vue"
import ActivePatientsTable from "@/modules/clinical-dashboard/components/ActivePatientsTable.vue"
import RecentActivityTimeline from "@/modules/clinical-dashboard/components/RecentActivityTimeline.vue"
import PatientFlowBoard from "@/modules/clinical-dashboard/components/PatientFlowBoard.vue"
import LiveKpiGrid from "@/modules/clinical-dashboard/components/LiveKpiGrid.vue"
import LiveFeedTimeline from "@/modules/clinical-dashboard/components/LiveFeedTimeline.vue"
import ServiceStatusBoard from "@/modules/clinical-dashboard/components/ServiceStatusBoard.vue"
import IntelligentAlertsBoard from "@/modules/clinical-dashboard/components/IntelligentAlertsBoard.vue"

const store = useClinicalDashboardStore()
const realtimeStatus = ref("déconnecté")

async function refreshCommandCenter() {
  await store.fetchDashboard()
}

async function handleDashboardUpdate() {
  await refreshCommandCenter()
}

onMounted(async () => {
  await refreshCommandCenter()

  const result = notificationsService.connectRealtime({
    onConnect: () => {
      realtimeStatus.value = "connecté"
    },
    onDisconnect: () => {
      realtimeStatus.value = "déconnecté"
    },
    onError: () => {
      realtimeStatus.value = "erreur"
    },
  })

  realtimeStatus.value = result.connected ? "connecté" : "en attente"

  notificationsService.subscribeRealtime(
    "clinical-dashboard:update",
    handleDashboardUpdate,
  )
})

onUnmounted(() => {
  notificationsService.unsubscribeRealtime(
    "clinical-dashboard:update",
    handleDashboardUpdate,
  )
})
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="text-2xl font-bold text-slate-950">
          Centre de Commande Hospitalier
        </h1>
        <p class="text-sm text-slate-500">
          Supervision opérationnelle des flux patients, alertes et services.
        </p>
      </div>

      <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        Temps réel : {{ realtimeStatus }}
      </div>
    </header>

    <LiveKpiGrid
      :cards="store.liveKpis.cards"
      :generated-at="store.liveKpis.generatedAt"
    />

    <IntelligentAlertsBoard
      :alerts="store.intelligentAlerts.alerts"
      :critical-count="store.intelligentAlerts.criticalCount"
      :warning-count="store.intelligentAlerts.warningCount"
      :generated-at="store.intelligentAlerts.generatedAt"
    />

    <AlertsGrid :alerts="store.criticalAlerts" />

    <OccupancyGrid :occupancy="store.occupancy" />

    <LiveFeedTimeline
      :items="store.liveFeed.items"
      :generated-at="store.liveFeed.generatedAt"
    />

    <ServiceStatusBoard
      :services="store.serviceStatus.services"
      :generated-at="store.serviceStatus.generatedAt"
    />

    <PatientFlowBoard :flow="store.patientFlow" />

    <ActivePatientsTable :patients="store.activePatients" />

    <RecentActivityTimeline :events="store.recentActivity" />
  </div>
</template>




