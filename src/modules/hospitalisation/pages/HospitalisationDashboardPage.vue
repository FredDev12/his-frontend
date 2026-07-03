<script setup>
import { computed, onMounted } from "vue"
import { RouterLink } from "vue-router"

import BaseBadge from "@/shared/ui/base/BaseBadge.vue"
import BaseButton from "@/shared/ui/base/BaseButton.vue"
import BaseCard from "@/shared/ui/base/BaseCard.vue"
import DataTable from "@/shared/ui/data/DataTable.vue"

import { useAuthStore } from "@/modules/auth/stores/auth.store"
import { useHospitalisationStore } from "@/modules/hospitalisation/stores/hospitalisation.store"

const auth = useAuthStore()
const store = useHospitalisationStore()

const stats = computed(() => store.hospitalisationKpis)

const columns = [
  { key: "code", label: "Hospitalisation" },
  { key: "patient", label: "Patient" },
  { key: "service", label: "Service" },
  { key: "statut", label: "Statut" },
]

const recentRows = computed(() =>
  store.hospitalisations.slice(0, 6).map((item) => ({
    id: item.id,
    code: item.hospitalisationCode,
    patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
    service: item.serviceName,
    statut: item.status,
  })),
)

onMounted(() => {
  store.fetchHospitalisations({ page: 1, limit: 10 })
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">Hospitalisation</BaseBadge>
        <h1 class="mt-3 his-page-title">Dashboard Hospitalisation</h1>
        <p class="his-page-subtitle">
          Admissions, lits occupés, hospitalisations actives et sorties.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('hospitalisation:create')" to="/hospitalisation/create">
        <BaseButton>Nouvelle hospitalisation</BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <BaseCard title="Total">
        <p class="text-3xl font-bold text-slate-950">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Hospitalisations</p>
      </BaseCard>

      <BaseCard title="Actives">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.actives }}</p>
        <p class="mt-1 text-sm text-slate-500">Patients admis</p>
      </BaseCard>

      <BaseCard title="Admissions">
        <p class="text-3xl font-bold text-blue-700">{{ stats.admissionsToday }}</p>
        <p class="mt-1 text-sm text-slate-500">Admissions chargées</p>
      </BaseCard>

      <BaseCard title="Sorties">
        <p class="text-3xl font-bold text-amber-600">{{ stats.sorties }}</p>
        <p class="mt-1 text-sm text-slate-500">Sorties enregistrées</p>
      </BaseCard>

      <BaseCard title="Lits occupés">
        <p class="text-3xl font-bold text-rose-700">{{ stats.litsOccupes }}</p>
        <p class="mt-1 text-sm text-slate-500">Occupation actuelle</p>
      </BaseCard>

      <BaseCard title="Occupation">
        <p class="text-3xl font-bold text-slate-700">{{ stats.tauxOccupation }}%</p>
        <p class="mt-1 text-sm text-slate-500">Taux estimé</p>
      </BaseCard>
    </section>

    <BaseCard title="Activité hospitalisation récente" subtitle="Dernières hospitalisations chargées.">
      <DataTable :columns="columns" :rows="recentRows" empty-text="Aucune hospitalisation chargée." />

      <div class="mt-5 flex justify-end">
        <RouterLink to="/hospitalisation">
          <BaseButton variant="secondary">Voir toutes les hospitalisations</BaseButton>
        </RouterLink>
      </div>
    </BaseCard>
  </div>
</template>
