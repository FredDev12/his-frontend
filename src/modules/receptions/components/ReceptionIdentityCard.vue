<script setup>
import ReceptionStatusBadge from '@/modules/receptions/components/ReceptionStatusBadge.vue'

defineProps({
  reception: {
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
            {{ dash(reception.nom) }} {{ dash(reception.postnom) }} {{ dash(reception.prenom) }}
          </h2>

          <ReceptionStatusBadge :reception="reception" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ dash(reception.numero_patient) }} · Fiche {{ dash(reception.numero_fiche) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créée le : {{ dash(reception.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Service</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(reception.service) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Téléphone</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(reception.telephone) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Montant fiche</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(reception.montant) }} CDF</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Paiement</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(reception.paiement_effectue) ? 'Effectué' : 'En attente' }}
        </dd>
      </div>
    </dl>
  </section>
</template>
