<script setup>
import RendezVousStatusBadge from '@/modules/rendez-vous/components/RendezVousStatusBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  rdv: {
    type: Object,
    required: true,
  },
})

function dash(value) {
  return value || '—'
}

function fullName(rdv) {
  return [rdv.nom, rdv.postnom, rdv.prenom].filter(Boolean).join(' ') || '—'
}

function rdvDate(rdv) {
  if (!rdv.date_rdv) return '—'
  return formatDateTime(`${rdv.date_rdv}T${rdv.heure_rdv || '00:00'}`)
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ fullName(rdv) }}
          </h2>

          <RendezVousStatusBadge :statut="rdv.statut" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ dash(rdv.numero_patient) }} · Fiche {{ dash(rdv.numero_fiche) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {{ rdvDate(rdv) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Service</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(rdv.service) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Médecin / agent</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(rdv.medecin) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Téléphone</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(rdv.telephone) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Créé le</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(rdv.created_at) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
