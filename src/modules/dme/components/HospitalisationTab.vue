<script setup>
defineProps({
  hospitalisations: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Service</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Lit</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Entrée</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Sortie</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="hospitalisations.length === 0">
          <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucune hospitalisation chargée.
          </td>
        </tr>

        <tr v-for="item in hospitalisations" :key="item.id || item.admittedAt">
          <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ item.serviceName || item.service || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.bedNumber || item.lit || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.admittedAt || item.admitted_at || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.dischargedAt || item.discharged_at || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.status || item.statut || "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
