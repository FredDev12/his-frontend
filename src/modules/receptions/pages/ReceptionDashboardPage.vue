<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";

import BaseBadge from "@/shared/ui/base/BaseBadge.vue";
import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import DataTable from "@/shared/ui/data/DataTable.vue";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useReceptionsStore } from "@/modules/receptions/stores/receptions.store";

const auth = useAuthStore();
const store = useReceptionsStore();

const columns = [
  { key: "numero_fiche", label: "Fiche" },
  { key: "patient", label: "Patient" },
  { key: "service", label: "Service" },
  { key: "statut", label: "Statut" },
];

const recentRows = computed(() =>
  store.dashboard.recentItems.map((item) => ({
    id: item.id,
    numero_fiche: item.numero_fiche,
    patient:
      [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") ||
      "Patient",
    service: item.service || "TRIAGE",
    statut: item.statut || "—",
  })),
);

const stats = computed(() => store.receptionKpis);

onMounted(async () => {
  try {
    await store.fetchDashboard();
  } catch {
    // L'erreur est centralisée dans le store et affichée dans la page.
  }
});
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">Service Réception</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Réception</h1>

        <p class="his-page-subtitle">
          Accueil patient, création de fiche, ouverture d’épisode et orientation
          vers le triage.
        </p>
      </div>

      <RouterLink
        v-if="auth.hasPermission('reception:create')"
        to="/receptions/create"
      >
        <BaseButton>Nouvelle réception</BaseButton>
      </RouterLink>
    </header>

    <BaseCard v-if="store.error" title="Chargement impossible">
      <p class="text-sm text-red-700" role="alert">
        {{ store.error }}
      </p>

      <div class="mt-4">
        <BaseButton variant="secondary" @click="store.fetchDashboard">
          Réessayer
        </BaseButton>
      </div>
    </BaseCard>

    <section
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      aria-label="Indicateurs du jour"
    >
      <BaseCard title="Admissions aujourd’hui">
        <p class="text-3xl font-bold text-slate-950">
          {{ store.dashboardLoading ? "…" : stats.admissionsToday }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Fiches créées depuis 00:00 UTC
        </p>
      </BaseCard>

      <BaseCard title="Urgences aujourd’hui">
        <p class="text-3xl font-bold text-red-700">
          {{ store.dashboardLoading ? "…" : stats.urgences }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Priorités urgente, très urgente ou vitale
        </p>
      </BaseCard>

      <BaseCard title="Paiements en attente">
        <p class="text-3xl font-bold text-amber-600">
          {{ store.dashboardLoading ? "…" : stats.paiementsEnAttente }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Fiches actives avec paiement requis
        </p>
      </BaseCard>

      <BaseCard title="Orientés vers le triage">
        <p class="text-3xl font-bold text-blue-700">
          {{ store.dashboardLoading ? "…" : stats.orientesTriage }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Admissions validées aujourd’hui
        </p>
      </BaseCard>
    </section>

    <BaseCard
      title="File de réception récente"
      subtitle="Six dernières fiches, indépendamment de la pagination de la liste."
    >
      <DataTable
        :columns="columns"
        :rows="recentRows"
        :loading="store.dashboardLoading"
        empty-text="Aucune réception enregistrée."
      />

      <div class="mt-5 flex justify-end">
        <RouterLink to="/receptions">
          <BaseButton variant="secondary">
            Voir toutes les réceptions
          </BaseButton>
        </RouterLink>
      </div>
    </BaseCard>

    <BaseCard
      title="Règles métier Réception"
      subtitle="Contrôles obligatoires avant orientation du patient."
    >
      <ul class="space-y-2 text-sm text-slate-600">
        <li>• Identifier correctement le patient avant création de fiche.</li>
        <li>• Créer un épisode unique pour le passage courant.</li>
        <li>• Orienter vers le triage selon le workflow officiel.</li>
        <li>
          • Protéger les actions sensibles par confirmation et audit backend.
        </li>
      </ul>
    </BaseCard>
  </div>
</template>