<script setup>
import { computed, onMounted } from "vue"
import { RouterLink } from "vue-router"

import BaseBadge from "@/shared/ui/base/BaseBadge.vue"
import BaseButton from "@/shared/ui/base/BaseButton.vue"
import BaseCard from "@/shared/ui/base/BaseCard.vue"
import DataTable from "@/shared/ui/data/DataTable.vue"

import { useAuthStore } from "@/modules/auth/stores/auth.store"
import { useSortiesStore } from "@/modules/sorties/stores/sorties.store"

const auth = useAuthStore()
const store = useSortiesStore()
const stats = computed(() => store.sortieKpis)

const columns = [
  { key: "code", label: "Sortie" },
  { key: "patient", label: "Patient" },
  { key: "fiche", label: "Fiche" },
  { key: "statut", label: "Statut" },
]

const recentRows = computed(() =>
  store.sorties.slice(0, 6).map((item) => ({
    id: item.id,
    code: item.sortieCode,
    patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
    fiche: item.numero_fiche,
    statut: item.status,
  })),
)

onMounted(() => {
  store.fetchSorties({ page: 1, limit: 10 })
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="warning">Sortie patient</BaseBadge>
        <h1 class="mt-3 his-page-title">Dashboard Sorties</h1>
        <p class="his-page-subtitle">Clôture des épisodes, sorties validées et suivi patient.</p>
      </div>

      <RouterLink v-if="auth.hasPermission('sortie:create')" to="/sorties/create">
        <BaseButton variant="warning">Créer sortie</BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-3">
      <BaseCard title="Sorties">
        <p class="text-3xl font-bold text-slate-950">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Sorties chargées</p>
      </BaseCard>

      <BaseCard title="Validées">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.sortiesValidees }}</p>
        <p class="mt-1 text-sm text-slate-500">Sorties confirmées</p>
      </BaseCard>

      <BaseCard title="Patients sortis">
        <p class="text-3xl font-bold text-blue-700">{{ stats.patientsSortis }}</p>
        <p class="mt-1 text-sm text-slate-500">Patients concernés</p>
      </BaseCard>
    </section>

    <BaseCard title="Sorties récentes">
      <DataTable :columns="columns" :rows="recentRows" empty-text="Aucune sortie chargée." />
    </BaseCard>
  </div>
</template>
