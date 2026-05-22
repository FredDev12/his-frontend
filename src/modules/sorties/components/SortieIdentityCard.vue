<script setup>
import SortieStatusBadge from '@/modules/sorties/components/SortieStatusBadge.vue'

defineProps({
  sortie: {
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
            {{ dash(sortie.nom) }} {{ dash(sortie.postnom) }} {{ dash(sortie.prenom) }}
          </h2>

          <SortieStatusBadge :statut="sortie.statut" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ dash(sortie.numero_patient) }} · Fiche {{ dash(sortie.numero_fiche) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créée le : {{ dash(sortie.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Type sortie</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(sortie.type_sortie) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Date sortie</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(sortie.date_sortie) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Destination</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(sortie.destination) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Réception</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(sortie.reception_id) }}</dd>
      </div>
    </dl>
  </section>
</template>
