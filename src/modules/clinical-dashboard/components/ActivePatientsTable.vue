<script setup>
defineProps({
  patients: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="border-b border-slate-200 px-5 py-4">
      <h2 class="text-base font-semibold text-slate-950">File active patients</h2>
      <p class="text-sm text-slate-500">Patients actuellement présents dans le circuit clinique.</p>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Patient</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Épisode</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Service</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Priorité</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="patients.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun patient actif chargé.
            </td>
          </tr>

          <tr v-for="patient in patients" :key="patient.id || patient.episodeId">
            <td class="px-4 py-4 text-sm font-medium text-slate-950">
              {{ patient.patientName || patient.patient || "Patient" }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ patient.episodeId || "—" }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ patient.service || "—" }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ patient.status || "—" }}
            </td>

            <td class="px-4 py-4 text-sm font-medium text-slate-700">
              {{ patient.priority || "—" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
