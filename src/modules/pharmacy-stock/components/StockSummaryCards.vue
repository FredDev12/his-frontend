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
      <p class="text-sm font-medium text-slate-500">Produits</p>
      <p class="mt-3 text-3xl font-bold text-slate-950">{{ store.totalProducts }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Stock faible</p>
      <p class="mt-3 text-3xl font-bold text-amber-700">{{ store.lowStockCount }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Rupture</p>
      <p class="mt-3 text-3xl font-bold text-red-700">{{ store.outStockCount }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Valeur estimée</p>
      <p class="mt-3 text-xl font-bold text-emerald-700">
        {{ formatMoney(store.totalStockValue) }}
      </p>
    </article>
  </section>
</template>
