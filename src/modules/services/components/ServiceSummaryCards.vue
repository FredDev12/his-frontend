<script setup>
defineProps({
  store: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Services</p>
      <p class="mt-3 text-3xl font-bold text-slate-950">{{ store.totalServices }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Actifs</p>
      <p class="mt-3 text-3xl font-bold text-emerald-700">{{ store.activeCount }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Facturables</p>
      <p class="mt-3 text-3xl font-bold text-blue-700">{{ store.facturableCount }}</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Paiement requis</p>
      <p class="mt-3 text-3xl font-bold text-amber-700">{{ store.payableCount }}</p>
    </article>
  </section>
</template>
