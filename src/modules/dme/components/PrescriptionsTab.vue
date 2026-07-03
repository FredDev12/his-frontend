<script setup>
defineProps({
  prescriptions: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Médicament</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Dosage</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Durée</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="prescriptions.length === 0">
          <td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucune prescription chargée.
          </td>
        </tr>

        <tr v-for="item in prescriptions" :key="item.id || item.createdAt">
          <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ item.medicament || item.medicament_principal || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.dosage || item.dose || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.duree || item.duration || "—" }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ item.status || item.statut || "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
