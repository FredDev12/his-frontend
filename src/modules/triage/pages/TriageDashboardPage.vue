<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";

import BaseBadge from "@/shared/ui/base/BaseBadge.vue";
import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import DataTable from "@/shared/ui/data/DataTable.vue";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useTriageStore } from "@/modules/triage/stores/triage.store";

const auth = useAuthStore();
const store = useTriageStore();

const columns = [
  { key: "numero_fiche", label: "Fiche" },
  { key: "patient", label: "Patient" },
  { key: "priorite", label: "Priorité" },
  { key: "service", label: "Orientation" }
];

const recentRows = computed(() => {
  return store.triages.slice(0, 6).map((item) => ({
    id: item.id,
    numero_fiche: item.numero_fiche,
    patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
    priorite: item.priorite || "ROUTINE",
    service: item.service_entree || "Non orienté"
  }));
});

const stats = computed(() => store.triageKpis);

const criticalRows = computed(() => {
  return store.triages
    .filter((item) =>
      ["URGENT", "URGENCE", "VITALE"].includes(String(item.priorite || "").toUpperCase())
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      numero_fiche: item.numero_fiche,
      patient: [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient",
      priorite: item.priorite || "URGENT",
      service: item.service_entree || "Non orienté"
    }));
});

onMounted(() => {
  store.fetchTriages({ page: 1, limit: 10 });
});
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="emergency">Service Triage</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Triage / Infirmière</h1>

        <p class="his-page-subtitle">
          Surveillance des patients à trier, priorités cliniques, urgences et orientation vers consultation.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('triage:create')" to="/triage/create">
        <BaseButton variant="emergency">Nouveau triage</BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <BaseCard title="Patients attente">
        <p class="text-3xl font-bold text-slate-950">{{ stats.enAttente }}</p>
        <p class="mt-1 text-sm text-slate-500">Triages actifs</p>
      </BaseCard>

      <BaseCard title="Urgences">
        <p class="text-3xl font-bold text-rose-700">{{ stats.urgences }}</p>
        <p class="mt-1 text-sm text-slate-500">Priorité urgente/vitale</p>
      </BaseCard>

      <BaseCard title="Priorité élevée">
        <p class="text-3xl font-bold text-amber-600">{{ stats.prioriteElevee }}</p>
        <p class="mt-1 text-sm text-slate-500">Cas à surveiller</p>
      </BaseCard>

      <BaseCard title="Orientés">
        <p class="text-3xl font-bold text-blue-700">{{ stats.patientsOrientes }}</p>
        <p class="mt-1 text-sm text-slate-500">Vers consultation/service</p>
      </BaseCard>

      <BaseCard title="Non orientés">
        <p class="text-3xl font-bold text-slate-700">{{ stats.patientsNonOrientes }}</p>
        <p class="mt-1 text-sm text-slate-500">Orientation à compléter</p>
      </BaseCard>

      <BaseCard title="Triages">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Triages chargés</p>
      </BaseCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <BaseCard
        title="Urgences critiques"
        subtitle="Patients nécessitant une attention immédiate."
      >
        <DataTable
          :columns="columns"
          :rows="criticalRows"
          empty-text="Aucune urgence critique chargée."
        />
      </BaseCard>

      <BaseCard
        title="Derniers triages"
        subtitle="Derniers patients dans la file du service infirmier."
      >
        <DataTable
          :columns="columns"
          :rows="recentRows"
          empty-text="Aucun triage chargé."
        />

        <div class="mt-5 flex justify-end">
          <RouterLink to="/triage">
            <BaseButton variant="secondary">Voir toute la file triage</BaseButton>
          </RouterLink>
        </div>
      </BaseCard>
    </section>

    <BaseCard
      title="Règles métier Triage"
      subtitle="Sécurité clinique et orientation obligatoire."
    >
      <ul class="space-y-2 text-sm text-slate-600">
        <li>• Toujours vérifier l’identité du patient avant saisie des constantes.</li>
        <li>• Les urgences doivent utiliser le CTA distinct <strong>emergency</strong>.</li>
        <li>• Toute orientation clinique doit respecter le workflow vers consultation.</li>
        <li>• Les actions critiques doivent être confirmées et auditées côté backend.</li>
      </ul>
    </BaseCard>
  </div>
</template>

