<script setup>
defineProps({
  paiements: { type: Array, default: () => [] },
})

function formatMoney(value, devise = "CDF") {
  return `${Number(value || 0).toLocaleString("fr-FR")} ${devise}`
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Paiement</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Montant</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Mode</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Référence</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="paiements.length === 0">
          <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucun paiement chargé.
          </td>
        </tr>

        <tr v-for="item in paiements" :key="item.id || item.reference">
          <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ item.paiementCode || item.code || item.id || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.createdAt || item.created_at || item.date || "—" }}</td>
          <td class="px-4 py-4 text-sm font-semibold text-slate-950">{{ formatMoney(item.amount || item.montant, item.currency || item.devise) }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.method || item.mode || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.reference || "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
