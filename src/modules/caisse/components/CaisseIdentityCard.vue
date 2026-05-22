<script setup>
import CaisseStatusBadge from '@/modules/caisse/components/CaisseStatusBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  paiement: {
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
            {{ paiement.montant }} {{ paiement.devise }}
          </h2>

          <CaisseStatusBadge :statut="paiement.statut" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ dash(paiement.numero_patient) }} · Fiche {{ dash(paiement.numero_fiche) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créé le : {{ dash(paiement.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Service</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(paiement.service) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Mode paiement</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(paiement.mode_paiement) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Référence</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(paiement.reference) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Date paiement</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(paiement.date_paiement) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
