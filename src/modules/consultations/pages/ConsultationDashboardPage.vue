<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";

import BaseBadge from "@/shared/ui/base/BaseBadge.vue";
import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import DataTable from "@/shared/ui/data/DataTable.vue";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useConsultationsStore } from "@/modules/consultations/stores/consultations.store";

const auth = useAuthStore();
const store = useConsultationsStore();

const columns = [
  { key: "numero_fiche", label: "Fiche" },
  { key: "patient", label: "Patient" },
  { key: "diagnostic", label: "Diagnostic" },
  { key: "statut", label: "Statut" }
];

const recentRows = computed(() => {
  return store.consultations.slice(0, 6).map((item) => ({
    id: item.id,
    numero_fiche: item.numero_fiche,
    patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
    diagnostic: item.diagnostique || "Non renseigné",
    statut: item.statut || "active"
  }));
});

const stats = computed(() => store.consultationKpis);

onMounted(() => {
  store.fetchConsultations({ page: 1, limit: 10 });
});
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">Service Consultation</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Consultation / Médecin</h1>

        <p class="his-page-subtitle">
          Vue médecin : consultations, diagnostics, examens, prescriptions, hospitalisations et sorties.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('consultation:create')" to="/consultations/create">
        <BaseButton>Nouvelle consultation</BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <BaseCard title="Consultations">
        <p class="text-3xl font-bold text-slate-950">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Consultations chargées</p>
      </BaseCard>

      <BaseCard title="Patients examinés">
        <p class="text-3xl font-bold text-blue-700">{{ stats.patientsExamines }}</p>
        <p class="mt-1 text-sm text-slate-500">Patients pris en charge</p>
      </BaseCard>

      <BaseCard title="Diagnostics posés">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.diagnosticsPoses }}</p>
        <p class="mt-1 text-sm text-slate-500">Diagnostics renseignés</p>
      </BaseCard>

      <BaseCard title="Urgences médicales">
        <p class="text-3xl font-bold text-rose-700">{{ stats.urgences }}</p>
        <p class="mt-1 text-sm text-slate-500">Cas signalés urgents</p>
      </BaseCard>

      <BaseCard title="Examens demandés">
        <p class="text-3xl font-bold text-indigo-700">{{ stats.examensDemandes }}</p>
        <p class="mt-1 text-sm text-slate-500">Orientation laboratoire/imagerie</p>
      </BaseCard>

      <BaseCard title="Ordonnances">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.ordonnances }}</p>
        <p class="mt-1 text-sm text-slate-500">Prescriptions prévues</p>
      </BaseCard>

      <BaseCard title="Hospitalisations">
        <p class="text-3xl font-bold text-amber-600">{{ stats.hospitalisations }}</p>
        <p class="mt-1 text-sm text-slate-500">Décisions d’admission</p>
      </BaseCard>

      <BaseCard title="Sorties">
        <p class="text-3xl font-bold text-slate-700">{{ stats.sorties }}</p>
        <p class="mt-1 text-sm text-slate-500">Sorties autorisées</p>
      </BaseCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <BaseCard
        title="Activité médicale récente"
        subtitle="Dernières consultations enregistrées."
      >
        <DataTable
          :columns="columns"
          :rows="recentRows"
          empty-text="Aucune consultation chargée."
        />

        <div class="mt-5 flex justify-end">
          <RouterLink to="/consultations">
            <BaseButton variant="secondary">Voir toutes les consultations</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>

      <BaseCard
        title="Actions médicales"
        subtitle="Raccourcis selon les permissions du médecin."
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <RouterLink v-if="auth.hasPermission('consultation:create')" to="/consultations/create">
            <BaseButton class="w-full">Nouvelle consultation</BaseButton>
          </RouterLink>

          <RouterLink v-if="auth.hasPermission('examen:create')" to="/laboratoire/create">
            <BaseButton class="w-full" variant="secondary">Demander examen</BaseButton>
          </RouterLink>

          <RouterLink v-if="auth.hasPermission('prescription:create')" to="/pharmacie/create">
            <BaseButton class="w-full" variant="secondary">Créer ordonnance</BaseButton>
          </RouterLink>

          <RouterLink v-if="auth.hasPermission('hospitalisation:create')" to="/hospitalisations">
            <BaseButton class="w-full" variant="warning">Hospitaliser</BaseButton>
          </RouterLink>

          <RouterLink v-if="auth.hasPermission('sortie:create')" to="/sorties/create">
            <BaseButton class="w-full" variant="success">Autoriser sortie</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </section>

    <BaseCard
      title="Règles métier Consultation"
      subtitle="Contrôles médicaux et workflow clinique."
    >
      <ul class="space-y-2 text-sm text-slate-600">
        <li>• Toujours vérifier le contexte patient avant création consultation.</li>
        <li>• Toute décision médicale doit orienter clairement le patient.</li>
        <li>• Prescription, examen, hospitalisation et sortie doivent rester auditables.</li>
        <li>• Les actions critiques restent validées par le backend.</li>
      </ul>
    </BaseCard>
  </div>
</template>

