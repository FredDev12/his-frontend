<script setup>
import FactureStatusBadge from '@/modules/facturation/components/FactureStatusBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  facture: {
    type: Object,
    required: true,
  },
})

function fullName(facture) {
  return [facture.nom, facture.postnom, facture.prenom].filter(Boolean).join(' ') || '—'
}

function formatMoney(value, devise = 'CDF') {
  return `${Number(value || 0).toLocaleString('fr-FR')} ${devise}`
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ facture.numero }}
          </h2>

          <FactureStatusBadge :statut="facture.statut" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          {{ fullName(facture) }} · Patient N° {{ facture.numero_patient }} · Fiche
          {{ facture.numero_fiche }}
        </p>
      </div>

      <div class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        Total : {{ formatMoney(facture.total, facture.devise) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Sous-total</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatMoney(facture.sous_total, facture.devise) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Remise</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatMoney(facture.remise, facture.devise) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Taxe / frais</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatMoney(facture.taxe, facture.devise) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Créée le</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(facture.created_at) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
