<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";

import BaseBadge from "@/shared/ui/base/BaseBadge.vue";
import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import DataTable from "@/shared/ui/data/DataTable.vue";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useLaboratoireStore } from "@/modules/laboratoire/stores/laboratoire.store";

const auth = useAuthStore();
const store = useLaboratoireStore();

const columns = [
  { key: "numero_fiche", label: "Fiche" },
  { key: "patient", label: "Patient" },
  { key: "examen", label: "Examen" },
  { key: "statut", label: "Statut" }
];

const recentRows = computed(() => {
  return store.examens.slice(0, 6).map((item) => ({
    id: item.id,
    numero_fiche: item.numero_fiche,
    patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
    examen: item.examen_principal || "Examen",
    statut: item.statut || "pending"
  }));
});

const urgentRows = computed(() => {
  return store.examens
    .filter((item) =>
      String(`${item.examen_principal || ""} ${item.resultat || ""}`)
        .toLowerCase()
        .includes("urgent")
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      numero_fiche: item.numero_fiche,
      patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
      examen: item.examen_principal || "Examen",
      statut: item.statut || "urgent"
    }));
});

const stats = computed(() => store.laboratoireKpis);

onMounted(() => {
  store.fetchExamens({ page: 1, limit: 10 });
});
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">Service Laboratoire</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Laboratoire</h1>

        <p class="his-page-subtitle">
          Suivi des demandes d’examens, résultats disponibles, validations et urgences laboratoire.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('examen:create')" to="/laboratoire/create">
        <BaseButton>Nouvelle demande</BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <BaseCard title="Examens">
        <p class="text-3xl font-bold text-slate-950">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Demandes chargées</p>
      </BaseCard>

      <BaseCard title="En attente">
        <p class="text-3xl font-bold text-amber-600">{{ stats.enAttente }}</p>
        <p class="mt-1 text-sm text-slate-500">À traiter</p>
      </BaseCard>

      <BaseCard title="Résultats">
        <p class="text-3xl font-bold text-blue-700">{{ stats.resultatsDisponibles }}</p>
        <p class="mt-1 text-sm text-slate-500">Disponibles</p>
      </BaseCard>

      <BaseCard title="Validés">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.valides }}</p>
        <p class="mt-1 text-sm text-slate-500">Résultats validés</p>
      </BaseCard>

      <BaseCard title="Urgences">
        <p class="text-3xl font-bold text-rose-700">{{ stats.urgences }}</p>
        <p class="mt-1 text-sm text-slate-500">Demandes critiques</p>
      </BaseCard>

      <BaseCard title="Patients">
        <p class="text-3xl font-bold text-slate-700">{{ stats.patientsExamines }}</p>
        <p class="mt-1 text-sm text-slate-500">Patients concernés</p>
      </BaseCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <BaseCard title="Urgences laboratoire" subtitle="Demandes ou résultats signalés urgents.">
        <DataTable
          :columns="columns"
          :rows="urgentRows"
          empty-text="Aucune urgence laboratoire chargée."
        />
      </BaseCard>

      <BaseCard title="Demandes récentes" subtitle="Derniers examens chargés dans le service.">
        <DataTable
          :columns="columns"
          :rows="recentRows"
          empty-text="Aucune demande laboratoire chargée."
        />

        <div class="mt-5 flex justify-end">
          <RouterLink to="/laboratoire">
            <BaseButton variant="secondary">Voir toutes les demandes</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </section>

    <BaseCard title="Règles métier Laboratoire" subtitle="Sécurité des résultats et traçabilité.">
      <ul class="space-y-2 text-sm text-slate-600">
        <li>• Toute demande d’examen doit être liée à un patient et un épisode.</li>
        <li>• Les résultats doivent être vérifiés avant validation.</li>
        <li>• Toute modification de résultat doit être auditée côté backend.</li>
        <li>• Les demandes urgentes doivent rester distinctes visuellement.</li>
      </ul>
    </BaseCard>
  </div>
</template>

