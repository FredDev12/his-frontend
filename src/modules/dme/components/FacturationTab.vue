<script setup>
defineProps({
  factures: { type: Array, default: () => [] },
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
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Facture</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Montant</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="factures.length === 0">
          <td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucune facture chargée.
          </td>
        </tr>

        <tr v-for="item in factures" :key="item.id || item.numero">
          <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ item.numero || item.factureNumber || item.id || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.type || item.module || "—" }}</td>
          <td class="px-4 py-4 text-sm font-semibold text-slate-950">{{ formatMoney(item.total || item.amount, item.devise || item.currency) }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.status || item.statut || "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
