<script setup>
defineProps({
  flow: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-950">Flux patient</h2>
      <p class="text-sm text-slate-500">
        Répartition des patients selon l’étape actuelle du parcours.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="step in flow"
        :key="step.key"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-semibold text-slate-950">{{ step.label }}</h3>

          <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {{ step.count || 0 }}
          </span>
        </div>

        <div class="mt-4 space-y-3">
          <p v-if="!step.patients || step.patients.length === 0" class="text-sm text-slate-500">
            Aucun patient.
          </p>

          <div
            v-for="patient in step.patients"
            :key="patient.episodeId"
            class="rounded-xl border border-slate-100 bg-slate-50 p-3"
          >
            <p class="text-sm font-medium text-slate-950">
              {{ patient.patientName || "Patient" }}
            </p>

            <p class="mt-1 text-xs text-slate-500">
              {{ patient.service || "Service" }} · {{ patient.status || "—" }}
            </p>

            <p class="mt-1 text-xs font-medium text-slate-600">
              Priorité : {{ patient.priority || "—" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
