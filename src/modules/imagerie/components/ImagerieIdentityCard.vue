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

function fullName(examen) {
  return [
    examen.nom,
    examen.postnom,
    examen.prenom,
  ]
    .filter(Boolean)
    .join(' ') || '—'
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

          <ImagerieStatusBadge
            :statut="examen.statut"
          />
        </div>

        <p class="mt-2 text-sm font-medium text-slate-700">
          {{ fullName(examen) }}
        </p>

        <p class="mt-1 text-sm text-slate-500">
          Patient {{ dash(examen.numero_patient) }} ·
          Épisode {{ dash(examen.episode_code) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Demande :
        {{ dash(examen.examen_code) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">
          Modalité
        </dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(examen.type) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">
          Consultation
        </dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(examen.consultation_code) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">
          Épisode
        </dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(examen.episode_status) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">
          Compte rendu
        </dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{
            examen.resultat
              ? 'Disponible'
              : 'En attente'
          }}
        </dd>
      </div>
    </dl>
  </section>
</template>
