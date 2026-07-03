<script setup>
defineProps({
  patient: { type: Object, default: null },
  episode: { type: Object, default: null },
})
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Dossier patient</p>

        <h1 class="mt-2 text-2xl font-bold text-slate-950">
          {{ [patient?.nom, patient?.postnom, patient?.prenom].filter(Boolean).join(" ") || "Patient" }}
        </h1>

        <p class="mt-1 text-sm text-slate-500">
          ID patient : {{ patient?.id || patient?.numero_patient || "—" }}
          · Épisode : {{ episode?.id || episode?.numero_episode || "—" }}
        </p>
      </div>

      <div class="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <div>
          <span class="block text-xs text-slate-400">Sexe</span>
          <strong>{{ patient?.sexe || "—" }}</strong>
        </div>

        <div>
          <span class="block text-xs text-slate-400">Service</span>
          <strong>{{ episode?.serviceName || episode?.service || "—" }}</strong>
        </div>

        <div>
          <span class="block text-xs text-slate-400">Statut</span>
          <strong>{{ episode?.status || episode?.statut || "—" }}</strong>
        </div>
      </div>
    </div>
  </section>
</template>
