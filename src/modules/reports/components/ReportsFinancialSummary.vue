<script setup>
defineProps({
  finance: {
    type: Object,
    default: null,
  },
})

function formatMoney(value, devise) {
  const amount = Number(value || 0)

  return `${amount.toLocaleString('fr-FR')} ${devise || 'CDF'}`
}
</script>

<template>
  <section class="his-card p-5">
    <div>
      <h2 class="font-semibold text-slate-950">Résumé financier</h2>

      <p class="mt-1 text-sm text-slate-500">
        Synthèse des paiements enregistrés dans le module caisse.
      </p>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-500">Total encaissé</p>
        <p class="mt-2 text-xl font-bold text-slate-950">
          {{ formatMoney(finance?.total, finance?.devise) }}
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-500">Paiements validés</p>
        <p class="mt-2 text-xl font-bold text-emerald-700">
          {{ finance?.paidCount || 0 }}
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-500">Paiements en attente</p>
        <p class="mt-2 text-xl font-bold text-amber-700">
          {{ finance?.pendingPayments || 0 }}
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-500">Paiements annulés</p>
        <p class="mt-2 text-xl font-bold text-red-700">
          {{ finance?.cancelledPayments || 0 }}
        </p>
      </div>
    </div>
  </section>
</template>
