<script setup>
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  report: {
    type: Object,
    default: null,
  },
})

function generatedAt(report) {
  return formatDateTime(report?.generated_at)
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <h2 class="font-semibold text-slate-950">Synthèse activité HIS</h2>

        <p class="mt-1 text-sm text-slate-500">
          Vue globale du parcours patient et des modules transversaux.
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Généré le : {{ generatedAt(report) }}
      </div>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-500">Flux clinique</p>
        <p class="mt-2 text-sm leading-6 text-slate-700">
          Réception, triage, consultation, examens, pharmacie et sortie sont couverts.
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-500">Flux financier</p>
        <p class="mt-2 text-sm leading-6 text-slate-700">
          Les paiements sont suivis avec validation, attente et annulation.
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-500">Pilotage</p>
        <p class="mt-2 text-sm leading-6 text-slate-700">
          Les indicateurs aident l’administration à suivre l’activité hospitalière.
        </p>
      </div>
    </div>
  </section>
</template>
