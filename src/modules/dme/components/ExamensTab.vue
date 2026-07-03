<script setup>
defineProps({
  examens: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Résultat</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="examens.length === 0">
          <td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucun examen chargé.
          </td>
        </tr>

        <tr v-for="item in examens" :key="item.id || item.createdAt">
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.createdAt || item.created_at || item.date || "—" }}</td>
          <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ item.type || item.libelle || item.nom || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.resultat || item.result || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.status || item.statut || "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
