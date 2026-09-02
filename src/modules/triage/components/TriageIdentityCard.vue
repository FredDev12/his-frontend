<script setup>
import TriagePriorityBadge from '@/modules/triage/components/TriagePriorityBadge.vue'
import { formatTriageDateTime } from '@/modules/triage/workflow/triage-create.workflow'
import { patientDisplayName } from '@/shared/utils/patient'

defineProps({ triage: { type: Object, required: true } })

function dash(value) {
  return value === null || value === undefined || value === '' ? '—' : value
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ patientDisplayName(triage, triage.numero_patient) }}
          </h2>
          <TriagePriorityBadge :priorite="triage.priorite" />
        </div>
        <p class="mt-2 text-sm text-slate-500">
          Patient {{ dash(triage.numero_patient) }} · Épisode {{ dash(triage.numero_fiche) }} · Triage {{ dash(triage.triage_code) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Validé le {{ formatTriageDateTime(triage.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Température</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(triage.temperature) }} °C</dd>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Tension</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(triage.tension_arterielle) }}</dd>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">SpO₂</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(triage.spo2) }} %</dd>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Service</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(triage.service_entree) }}</dd>
      </div>
    </dl>
  </section>
</template>
