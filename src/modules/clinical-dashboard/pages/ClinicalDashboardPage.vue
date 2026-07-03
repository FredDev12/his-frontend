<script setup>
import { onMounted } from "vue"

import BaseCard from "@/shared/ui/base/BaseCard.vue"
import BaseButton from "@/shared/ui/base/BaseButton.vue"
import { useToastStore } from "@/shared/stores/toast.store"
import { useClinicalDashboardStore } from "@/modules/clinical-dashboard/stores/clinical-dashboard.store"
import AlertsGrid from "@/modules/clinical-dashboard/components/AlertsGrid.vue"
import ActivePatientsTable from "@/modules/clinical-dashboard/components/ActivePatientsTable.vue"
import OccupancyGrid from "@/modules/clinical-dashboard/components/OccupancyGrid.vue"
import RecentActivityTimeline from "@/modules/clinical-dashboard/components/RecentActivityTimeline.vue"
import PatientFlowBoard from "@/modules/clinical-dashboard/components/PatientFlowBoard.vue"

const store = useClinicalDashboardStore()
const toast = useToastStore()

async function loadDashboard() {
  try {
    await store.fetchDashboard()
  } catch (error) {
    toast.error(error.response?.data?.message || "Dashboard clinique indisponible.")
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Dashboard clinique global</h1>
        <p class="his-page-subtitle">
          Vue opérationnelle des patients, urgences, hospitalisations et sorties.
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

    <AlertsGrid :alerts="store.criticalAlerts" />

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <BaseCard title="Patients en attente">
        <p class="text-3xl font-bold text-amber-600">{{ store.stats.waitingPatients }}</p>
      </BaseCard>

      <BaseCard title="Consultations aujourd'hui">
        <p class="text-3xl font-bold text-blue-700">{{ store.stats.consultationsToday }}</p>
      </BaseCard>

      <BaseCard title="Hospitalisations actives">
        <p class="text-3xl font-bold text-emerald-700">{{ store.stats.activeHospitalisations }}</p>
      </BaseCard>

      <BaseCard title="Urgences">
        <p class="text-3xl font-bold text-rose-700">{{ store.stats.emergencyPatients }}</p>
      </BaseCard>

      <BaseCard title="Sorties du jour">
        <p class="text-3xl font-bold text-slate-950">{{ store.stats.dischargesToday }}</p>
      </BaseCard>

      <BaseCard title="Lits occupés">
        <p class="text-3xl font-bold text-slate-950">{{ store.stats.occupiedBeds }}</p>
      </BaseCard>

      <BaseCard title="Lits libres">
        <p class="text-3xl font-bold text-slate-950">{{ store.stats.freeBeds }}</p>
      </BaseCard>
    </section>

    <OccupancyGrid :occupancy="store.occupancy" />

    <PatientFlowBoard :flow="store.patientFlow" />

    <RecentActivityTimeline :events="store.recentActivity" />

    <ActivePatientsTable :patients="store.activePatients" />

    <section class="grid gap-4 xl:grid-cols-2">
      <BaseCard title="File active patients" subtitle="Patients en cours de parcours clinique.">
        <p v-if="store.activeQueue.length === 0" class="text-sm text-slate-500">
          Aucun patient actif chargé.
        </p>

        <div
          v-for="item in store.activeQueue"
          :key="item.id"
          class="border-b border-slate-100 py-3 last:border-0"
        >
          <p class="font-medium text-slate-950">
            {{ item.patient?.nom || item.patient?.lastName || "Patient" }}
            {{ item.patient?.prenom || item.patient?.firstName || "" }}
          </p>
          <p class="text-sm text-slate-500">
            Statut : {{ item.status || item.statut || "—" }}
            · Service : {{ item.service?.name || item.service?.nom || "—" }}
          </p>
        </div>
      </BaseCard>

      <BaseCard title="Alertes critiques" subtitle="Risques opérationnels à traiter.">
        <p v-if="store.alerts.length === 0" class="text-sm text-slate-500">
          Aucune alerte critique.
        </p>

        <div
          v-for="alert in store.alerts"
          :key="alert.id || alert.message"
          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {{ alert.message || alert.title }}
        </div>
      </BaseCard>
    </section>
  </div>
</template>





