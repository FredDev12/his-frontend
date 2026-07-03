<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";

import BaseBadge from "@/shared/ui/base/BaseBadge.vue";
import BaseButton from "@/shared/ui/base/BaseButton.vue";
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import DataTable from "@/shared/ui/data/DataTable.vue";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { usePaiementsStore } from "@/modules/paiements/stores/paiements.store";

const auth = useAuthStore();
const store = usePaiementsStore();

const stats = computed(() => store.caisseKpis);

const columns = [
  { key: "code", label: "Paiement" },
  { key: "facture", label: "Facture" },
  { key: "montant", label: "Montant" },
  { key: "statut", label: "Statut" }
];

const recentRows = computed(() =>
  store.paiements.slice(0, 6).map((item) => ({
    id: item.id,
    code: item.paiementCode,
    facture: item.factureNumber || item.factureId || "—",
    montant: formatMoney(item.amount, item.currency),
    statut: item.status
  }))
);

onMounted(() => {
  store.fetchPaiements({ page: 1, limit: 10 });
});

function formatMoney(value, devise = "CDF") {
  return `${Number(value || 0).toLocaleString("fr-FR")} ${devise}`;
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="success">Caisse</BaseBadge>

        <h1 class="mt-3 his-page-title">Dashboard Caisse</h1>

        <p class="his-page-subtitle">
          Paiements réels, encaissements, annulations et suivi journalier de caisse.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('paiement:create')" to="/paiements/create">
        <BaseButton>Enregistrer paiement</BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <BaseCard title="Paiements">
        <p class="text-3xl font-bold text-slate-950">{{ stats.total }}</p>
        <p class="mt-1 text-sm text-slate-500">Paiements chargés</p>
      </BaseCard>

      <BaseCard title="Aujourd’hui">
        <p class="text-3xl font-bold text-blue-700">{{ stats.paiementsToday }}</p>
        <p class="mt-1 text-sm text-slate-500">Paiements du jour</p>
      </BaseCard>

      <BaseCard title="Validés">
        <p class="text-3xl font-bold text-emerald-700">{{ stats.paiementsValides }}</p>
        <p class="mt-1 text-sm text-slate-500">Encaissements valides</p>
      </BaseCard>

      <BaseCard title="Annulés">
        <p class="text-3xl font-bold text-amber-600">{{ stats.paiementsAnnules }}</p>
        <p class="mt-1 text-sm text-slate-500">Paiements annulés</p>
      </BaseCard>

      <BaseCard title="Montant encaissé">
        <p class="text-3xl font-bold text-emerald-700">
          {{ formatMoney(stats.montantEncaisse, stats.devise) }}
        </p>
        <p class="mt-1 text-sm text-slate-500">Total validé</p>
      </BaseCard>

      <BaseCard title="Montant annulé">
        <p class="text-3xl font-bold text-rose-700">
          {{ formatMoney(stats.montantAnnule, stats.devise) }}
        </p>
        <p class="mt-1 text-sm text-slate-500">Total annulé</p>
      </BaseCard>
    </section>

    <BaseCard title="Activité caisse récente" subtitle="Derniers paiements enregistrés.">
      <DataTable
        :columns="columns"
        :rows="recentRows"
        empty-text="Aucun paiement chargé."
      />

      <div class="mt-5 flex justify-end">
        <RouterLink to="/paiements">
          <BaseButton variant="secondary">Voir tous les paiements</BaseButton>
        </RouterLink>
      </div>
    </BaseCard>

    <BaseCard title="Règles métier Caisse" subtitle="Sécurité financière.">
      <ul class="space-y-2 text-sm text-slate-600">
        <li>• Tout paiement doit être lié à une facture existante.</li>
        <li>• Une annulation de paiement doit être confirmée et auditée côté backend.</li>
        <li>• Le backend reste l’autorité pour valider le montant et le statut facture.</li>
      </ul>
    </BaseCard>
  </div>
</template>
