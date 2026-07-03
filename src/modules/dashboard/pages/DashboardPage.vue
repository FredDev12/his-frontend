<script setup>
import { computed, onMounted } from "vue";

import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseBadge from "@/shared/ui/base/BaseBadge.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";

import DashboardStatCard from "@/modules/dashboard/components/DashboardStatCard.vue";
import DashboardQuickActions from "@/modules/dashboard/components/DashboardQuickActions.vue";
import DashboardRecentActivity from "@/modules/dashboard/components/DashboardRecentActivity.vue";
import DashboardOperationalStatus from "@/modules/dashboard/components/DashboardOperationalStatus.vue";
import DashboardNotificationsPanel from "@/modules/dashboard/components/DashboardNotificationsPanel.vue";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useDashboardStore } from "@/modules/dashboard/stores/dashboard.store";
import { useToastStore } from "@/shared/stores/toast.store";
import { formatDateTime } from "@/shared/utils/date";

const auth = useAuthStore();
const store = useDashboardStore();
const toast = useToastStore();

const workflowSteps = [
  {
    key: "reception",
    title: "Réception",
    route: "/receptions",
    permission: "reception:read",
    description: "Création fiche patient et ouverture épisode.",
    kpiLabel: "Réceptions du jour",
    kpiKey: "receptionsToday"
  },
  {
    key: "triage",
    title: "Triage",
    route: "/triage",
    permission: "triage:read",
    description: "Constantes, priorité et orientation clinique.",
    kpiLabel: "Urgences triage",
    kpiKey: "urgentTriage"
  },
  {
    key: "consultation",
    title: "Consultation",
    route: "/consultations",
    permission: "consultation:read",
    description: "Diagnostic, décision médicale et plan de prise en charge.",
    kpiLabel: "Consultations du jour",
    kpiKey: "consultationsToday"
  },
  {
    key: "examens",
    title: "Examens",
    route: "/laboratoire",
    permission: "examen:read",
    description: "Demandes laboratoire, imagerie et résultats.",
    kpiLabel: "Examens",
    kpiKey: "examensToday"
  },
  {
    key: "pharmacie",
    title: "Pharmacie",
    route: "/pharmacie",
    permission: "pharmacie:read",
    description: "Dispensation des prescriptions.",
    kpiLabel: "Prescriptions",
    kpiKey: "prescriptionsToday"
  },
  {
    key: "facturation",
    title: "Facturation",
    route: "/facturation",
    permission: "facture:read",
    description: "Factures et statuts financiers.",
    kpiLabel: "Factures",
    kpiKey: "facturesToday"
  },
  {
    key: "paiement",
    title: "Paiement",
    route: "/caisse",
    permission: "paiement:read",
    description: "Encaissements et reçus.",
    kpiLabel: "Paiements du jour",
    kpiKey: "paiementsToday"
  },
  {
    key: "hospitalisation",
    title: "Hospitalisation",
    route: "/hospitalisations",
    permission: "hospitalisation:read",
    description: "Admission, lit et clôture hospitalisation.",
    kpiLabel: "Hospitalisations",
    kpiKey: "hospitalisationsActive"
  },
  {
    key: "sortie",
    title: "Sortie",
    route: "/sorties",
    permission: "sortie:read",
    description: "Sortie patient et clôture épisode.",
    kpiLabel: "Sorties du jour",
    kpiKey: "sortiesToday"
  }
];

const roleDashboards = [
  {
    key: "admin",
    title: "Dashboard ADMIN",
    permission: "dashboard:read",
    description: "Vue globale, sécurité, audit et supervision."
  },
  {
    key: "reception",
    title: "Dashboard Réception",
    permission: "reception:read",
    description: "Files d’attente, nouvelles fiches et orientations."
  },
  {
    key: "triage",
    title: "Dashboard Infirmier",
    permission: "triage:read",
    description: "Priorités, urgences et constantes."
  },
  {
    key: "medecin",
    title: "Dashboard Médecin",
    permission: "consultation:read",
    description: "Consultations, examens, prescriptions et décisions."
  },
  {
    key: "laboratoire",
    title: "Dashboard Laboratoire",
    permission: "examen:read",
    description: "Demandes en attente et résultats à valider."
  },
  {
    key: "imagerie",
    title: "Dashboard Imagerie",
    permission: "examen:read",
    description: "Demandes d’imagerie et comptes rendus."
  },
  {
    key: "pharmacie",
    title: "Dashboard Pharmacie",
    permission: "pharmacie:read",
    description: "Prescriptions à servir et alertes stock."
  },
  {
    key: "caisse",
    title: "Dashboard Caisse",
    permission: "paiement:read",
    description: "Paiements, recettes et factures ouvertes."
  },
  {
    key: "direction",
    title: "Dashboard Direction",
    permission: "audit:read",
    description: "Indicateurs institutionnels et audit."
  }
];

const authorizedWorkflowSteps = computed(() => {
  return workflowSteps.filter((step) => auth.hasPermission(step.permission));
});

const authorizedRoleDashboards = computed(() => {
  return roleDashboards.filter((dashboard) => auth.hasPermission(dashboard.permission));
});

onMounted(() => {
  loadDashboard();
});

async function loadDashboard() {
  try {
    await store.fetchDashboard();
  } catch (error) {
    console.error("[Dashboard] Chargement impossible:", error);
    toast.error(error.response?.data?.message || error.message || "Impossible de charger le dashboard.");
  }
}

function kpiValue(key) {
  return store.dashboard?.kpis?.[key] ?? 0;
}

function formatMoney(value, devise) {
  const amount = Number(value || 0);

  return `${amount.toLocaleString("fr-FR")} ${devise || "CDF"}`;
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">HIS Workflow</BaseBadge>

        <h1 class="mt-3 his-page-title">Tableau de bord HIS principal</h1>

        <p class="his-page-subtitle">
          Vue synthèse du flux patient : Réception → Triage → Consultation → Examens →
          Pharmacie → Facturation → Paiement → Hospitalisation → Sortie.
        </p>

        <p v-if="store.dashboard" class="mt-2 text-sm text-slate-400">
          Dernière actualisation : {{ formatDateTime(store.dashboard.generated_at) }}
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

    <BaseCard
      title="Workflow hospitalier"
      subtitle="Progression officielle du patient dans le HIS."
    >
      <div class="grid gap-3 md:grid-cols-3 xl:grid-cols-9">
        <RouterLink
          v-for="step in authorizedWorkflowSteps"
          :key="step.key"
          :to="step.route"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ step.kpiLabel }}
          </p>

          <p class="mt-2 text-2xl font-bold text-slate-950">
            {{ kpiValue(step.kpiKey) }}
          </p>

          <h3 class="mt-3 text-sm font-bold text-slate-900">
            {{ step.title }}
          </h3>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            {{ step.description }}
          </p>
        </RouterLink>
      </div>
    </BaseCard>

    <BaseCard
      title="Dashboards par service"
      subtitle="Accès personnalisé selon le rôle et les permissions de l’utilisateur."
    >
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="dashboard in authorizedRoleDashboards"
          :key="dashboard.key"
          class="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <h3 class="text-sm font-bold text-slate-950">
            {{ dashboard.title }}
          </h3>

          <p class="mt-1 text-sm text-slate-500">
            {{ dashboard.description }}
          </p>

          <BaseBadge class="mt-3" variant="success">
            Autorisé
          </BaseBadge>
        </div>
      </div>
    </BaseCard>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du tableau de bord...
    </div>

    <template v-else-if="store.dashboard">
      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Patients"
          :value="store.dashboard.kpis.patients"
          subtitle="Patients enregistrés"
          tone="primary"
        />

        <DashboardStatCard
          title="Réceptions du jour"
          :value="store.dashboard.kpis.receptionsToday"
          subtitle="Admissions aujourd’hui"
          tone="success"
        />

        <DashboardStatCard
          title="Consultations du jour"
          :value="store.dashboard.kpis.consultationsToday"
          subtitle="Consultations enregistrées"
          tone="primary"
        />

        <DashboardStatCard
          title="Urgences triage"
          :value="store.dashboard.kpis.urgentTriage"
          subtitle="Cas urgents détectés"
          tone="danger"
        />

        <DashboardStatCard
          title="Paiements du jour"
          :value="store.dashboard.kpis.paiementsToday"
          subtitle="Transactions caisse"
          tone="success"
        />

        <DashboardStatCard
          title="Recettes du jour"
          :value="
            formatMoney(store.dashboard.kpis.totalPaiementsToday, store.dashboard.kpis.devise)
          "
          subtitle="Montant encaissé aujourd’hui"
          tone="success"
        />

        <DashboardStatCard
          title="Sorties du jour"
          :value="store.dashboard.kpis.sortiesToday"
          subtitle="Patients clôturés"
          tone="warning"
        />

        <DashboardStatCard
          title="Notifications non lues"
          :value="store.dashboard.kpis.unreadNotifications"
          subtitle="Événements à consulter"
          tone="warning"
        />
      </section>

      <DashboardQuickActions />

      <section class="grid gap-6 xl:grid-cols-2">
        <DashboardOperationalStatus
          :alerts="store.dashboard.alerts"
          :has-partial-errors="store.dashboard.technical.hasPartialErrors"
        />

        <DashboardNotificationsPanel :notifications="store.dashboard.latestNotifications" />
      </section>

      <DashboardRecentActivity :activities="store.dashboard.recentActivity" />
    </template>
  </div>
</template>
