<script setup>
import { onMounted } from "vue"

import BaseCard from "@/shared/ui/base/BaseCard.vue"
import BaseButton from "@/shared/ui/base/BaseButton.vue"
import { useToastStore } from "@/shared/stores/toast.store"
import { useDmeDashboardStore } from "@/modules/dme/stores/dme-dashboard.store"

const store = useDmeDashboardStore()
const toast = useToastStore()

async function loadDashboard() {
  try {
    await store.fetchDashboard()
  } catch (error) {
    toast.error(error.response?.data?.message || "Dashboard DME indisponible.")
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Dashboard DME</h1>
        <p class="his-page-subtitle">
          Vue clinique dynamique du Dossier Médical Électronique.
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

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <BaseCard title="Patients suivis aujourd'hui">
        <p class="text-3xl font-bold text-slate-950">{{ store.stats.patientsToday }}</p>
      </BaseCard>

      <BaseCard title="Dossiers ouverts">
        <p class="text-3xl font-bold text-blue-700">{{ store.stats.openRecords }}</p>
      </BaseCard>

      <BaseCard title="Hospitalisations actives">
        <p class="text-3xl font-bold text-emerald-700">{{ store.stats.activeHospitalisations }}</p>
      </BaseCard>

      <BaseCard title="Patients prêts à sortir">
        <p class="text-3xl font-bold text-amber-600">{{ store.stats.readyForDischarge }}</p>
      </BaseCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-2">
      <BaseCard title="Dernières consultations">
        <p v-if="store.recentConsultations.length === 0" class="text-sm text-slate-500">
          Aucune consultation récente.
        </p>

        <div v-for="item in store.recentConsultations" :key="item.id" class="border-b border-slate-100 py-3 last:border-0">
          <p class="font-medium text-slate-950">
            {{ item.patient?.lastName || "Patient" }} {{ item.patient?.firstName || "" }}
          </p>
          <p class="text-sm text-slate-500">{{ item.createdAt || "—" }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Derniers examens">
        <p v-if="store.recentExamens.length === 0" class="text-sm text-slate-500">
          Aucun examen récent.
        </p>

        <div v-for="item in store.recentExamens" :key="item.id" class="border-b border-slate-100 py-3 last:border-0">
          <p class="font-medium text-slate-950">{{ item.name || item.type || "Examen" }}</p>
          <p class="text-sm text-slate-500">{{ item.status || "—" }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Dernières prescriptions">
        <p v-if="store.recentPrescriptions.length === 0" class="text-sm text-slate-500">
          Aucune prescription récente.
        </p>

        <div v-for="item in store.recentPrescriptions" :key="item.id" class="border-b border-slate-100 py-3 last:border-0">
          <p class="font-medium text-slate-950">
            Prescription #{{ item.id }}
          </p>
          <p class="text-sm text-slate-500">{{ item.status || "—" }}</p>
        </div>
      </BaseCard>

      <BaseCard title="Derniers paiements">
        <p v-if="store.recentPayments.length === 0" class="text-sm text-slate-500">
          Aucun paiement récent.
        </p>

        <div v-for="item in store.recentPayments" :key="item.id" class="border-b border-slate-100 py-3 last:border-0">
          <p class="font-medium text-slate-950">
            {{ Number(item.amount || 0).toLocaleString("fr-FR") }} {{ item.currency || "CDF" }}
          </p>
          <p class="text-sm text-slate-500">{{ item.mode || item.method || "—" }}</p>
        </div>
      </BaseCard>
    </section>
  </div>
</template>
