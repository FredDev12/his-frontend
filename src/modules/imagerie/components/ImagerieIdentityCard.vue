<script setup>
import ImagerieStatusBadge from '@/modules/imagerie/components/ImagerieStatusBadge.vue'

defineProps({
  examen: {
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
            {{ dash(examen.examen_principal) }}
          </h2>

          <ImagerieStatusBadge :statut="examen.statut" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ dash(examen.numero_patient) }} · Fiche {{ dash(examen.numero_fiche) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créé le : {{ dash(examen.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Date</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(examen.date) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Zone</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(examen.zone) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Consultation</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(examen.consultation_id) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Conclusion</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ examen.conclusion ? 'Disponible' : 'En attente' }}
        </dd>
      </div>
    </dl>
  </section>
</template>
