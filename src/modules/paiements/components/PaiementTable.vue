<script setup>
import BaseButton from "@/shared/ui/base/BaseButton.vue";

defineProps({
  paiements: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  canCancel: { type: Boolean, default: false },
});

defineEmits(["cancel"]);

function formatMoney(value, devise = "CDF") {
  return `${Number(value || 0).toLocaleString("fr-FR")} ${devise}`;
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div v-if="loading" class="p-6 text-center text-sm text-slate-500">
      Chargement des paiements...
    </div>

    <table v-else class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Facture</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Montant</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Méthode</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="paiements.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucun paiement chargé.
          </td>
        </tr>

        <tr v-for="paiement in paiements" :key="paiement.id">
          <td class="px-4 py-4 text-sm font-medium text-slate-950">
            {{ paiement.paiementCode }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ paiement.factureNumber || paiement.factureId || "—" }}
          </td>

          <td class="px-4 py-4 text-sm font-semibold text-slate-950">
            {{ formatMoney(paiement.amount, paiement.currency) }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ paiement.method }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ paiement.status }}
          </td>

          <td class="px-4 py-4 text-right">
            <BaseButton
              v-if="canCancel && !['cancelled', 'canceled'].includes(String(paiement.status).toLowerCase())"
              variant="warning"
              size="sm"
              @click="$emit('cancel', paiement)"
            >
              Annuler
            </BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
