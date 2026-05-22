<script setup>
import ConsultationStatusBadge from '@/modules/consultations/components/ConsultationStatusBadge.vue'

defineProps({
  consultation: {
    type: Object,
    required: true,
  },
})

function dash(value) {
  return value || '—'
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ dash(consultation.nom) }} {{ dash(consultation.postnom) }}
            {{ dash(consultation.prenom) }}
          </h2>

          <ConsultationStatusBadge :statut="consultation.statut" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ dash(consultation.numero_patient) }} · Fiche
          {{ dash(consultation.numero_fiche) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créée le : {{ dash(consultation.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Service</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(consultation.service) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Diagnostic</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(consultation.diagnostique) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Réception</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(consultation.reception_id) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Triage</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(consultation.triage_id) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
