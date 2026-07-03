<script setup>
defineProps({
  consultations: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Médecin</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Motif</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Diagnostic</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Décision</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="consultations.length === 0">
          <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucune consultation chargée.
          </td>
        </tr>

        <tr v-for="item in consultations" :key="item.id || item.createdAt">
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.createdAt || item.created_at || item.date || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.medecin || item.doctor || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.motif || item.reason || "—" }}</td>
          <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ item.diagnostic || item.diagnostique || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.decision || item.status || "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
