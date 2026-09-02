<script setup>
import { computed } from 'vue'

import ReceptionStatusBadge from '@/modules/receptions/components/ReceptionStatusBadge.vue'

const props = defineProps({
  reception: {
    type: Object,
    required: true,
  },
})

const patientName = computed(() =>
  [props.reception.nom, props.reception.postnom, props.reception.prenom]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Patient non renseigné',
)

const paymentSummary = computed(() => {
  const status =
    props.reception.fichePayment?.status ||
    props.reception.paymentDisplayStatus ||
    (props.reception.paymentRequired
      ? props.reception.paymentValidated
        ? 'PAID'
        : 'PENDING'
      : 'NOT_REQUIRED')

  if (status === 'NOT_REQUIRED') return 'Non requis'
  if (status === 'PAID') return 'Payé'
  if (status === 'INCONSISTENT') return 'À vérifier'
  return 'À régulariser'
})

const amountSummary = computed(() => {
  if (paymentSummary.value === 'Non requis') return 'Non requis'

  const paiement = props.reception.fichePayment?.paiement
  const facture = props.reception.fichePayment?.facture
  const amount = paiement?.amount || facture?.amount
  const currency = paiement?.currency || facture?.currency

  if (amount === undefined || amount === null || amount === '') return '—'

  const numericAmount = Number(amount)
  const formatted = Number.isNaN(numericAmount)
    ? amount
    : new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 2,
      }).format(numericAmount)

  return `${formatted} ${currency || ''}`.trim()
})

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ patientName }}
          </h2>

          <ReceptionStatusBadge :reception="reception" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ reception.numero_patient || '—' }}
          · Réception {{ reception.numero_fiche || '—' }}
          · Épisode {{ reception.numero_episode || '—' }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créée le : {{ formatDate(reception.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Destination</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ reception.workflow?.destination || reception.service || 'TRIAGE' }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Téléphone</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ reception.telephone || '—' }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">
          Frais d’ouverture
        </dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ amountSummary }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Paiement</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ paymentSummary }}
        </dd>
      </div>
    </dl>
  </section>
</template>
