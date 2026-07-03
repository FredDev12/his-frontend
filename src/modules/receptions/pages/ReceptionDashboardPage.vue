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
  { key: "statut", label: "Statut" }
];

const recentRows = computed(() => {
  return store.receptions.slice(0, 6).map((item) => ({
    id: item.id,
    numero_fiche: item.numero_fiche,
    patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
    service: item.service || "Non orienté",
    statut: item.statut || "active"
  }));
});

const stats = computed(() => store.receptionKpis);

onMounted(() => {
  store.fetchReceptions({ page: 1, limite: 10 });
});
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">Service Réception</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Réception</h1>

        <p class="his-page-subtitle">
          Accueil patient, création de fiche, ouverture d’épisode et orientation vers le triage.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('reception:create')" to="/receptions/create">
        <BaseButton>Nouvelle réception</BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <BaseCard title="Admissions">
        <p class="text-3xl font-bold text-slate-950">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Réceptions enregistrées</p>
      </BaseCard>

      <BaseCard title="Urgences">
        <p class="text-3xl font-bold text-red-700">{{ stats.urgences }}</p>
        <p class="mt-1 text-sm text-slate-500">Patients marqués urgents</p>
      </BaseCard>

      <BaseCard title="Paiements attente">
        <p class="text-3xl font-bold text-amber-600">{{ stats.paiementsEnAttente }}</p>
        <p class="mt-1 text-sm text-slate-500">Fiches non payées</p>
      </BaseCard>

      <BaseCard title="Orientation triage">
        <p class="text-3xl font-bold text-blue-700">{{ stats.orientesTriage }}</p>
        <p class="mt-1 text-sm text-slate-500">Patients orientés triage</p>
      </BaseCard>
    </section>

    <BaseCard
      title="File de réception"
      subtitle="Dernières fiches créées ou chargées dans le service."
    >
      <DataTable
        :columns="columns"
        :rows="recentRows"
        empty-text="Aucune réception chargée."
      />

      <div class="mt-5 flex justify-end">
        <RouterLink to="/receptions">
          <BaseButton variant="secondary">Voir toutes les réceptions</BaseButton>
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
        <li>• Orienter vers triage selon le workflow officiel.</li>
        <li>• Protéger les actions sensibles par confirmation et audit backend.</li>
      </ul>
    </BaseCard>
  </div>
</template>


