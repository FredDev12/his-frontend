<script setup>
defineProps({
  store: {
    type: Object,
    required: true,
  },
})

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} CDF`
}
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Factures</p>
      <p class="mt-3 text-3xl font-bold text-slate-950">{{ store.totalFactures }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Émises</p>
      <p class="mt-3 text-3xl font-bold text-blue-700">{{ store.issuedCount }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Payées</p>
      <p class="mt-3 text-3xl font-bold text-emerald-700">{{ store.paidCount }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Montant total</p>
      <p class="mt-3 text-xl font-bold text-slate-950">{{ formatMoney(store.totalAmount) }}</p>
    </article>
  </section>
</template>
