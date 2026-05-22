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
      <p class="text-sm font-medium text-slate-500">Modules API</p>

      <p class="mt-3 text-3xl font-bold text-slate-950">
        {{ store.onlineApiModules }}/{{ store.totalApiModules }}
      </p>

      <p class="mt-2 text-sm text-slate-500">Modules connectés disponibles.</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Modules locaux</p>

      <p class="mt-3 text-3xl font-bold text-blue-700">
        {{ store.availableLocalModules }}/{{ store.totalLocalModules }}
      </p>

      <p class="mt-2 text-sm text-slate-500">Référentiels frontend initialisés.</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Alertes API</p>

      <p
        class="mt-3 text-3xl font-bold"
        :class="store.apiErrorModules > 0 ? 'text-red-700' : 'text-emerald-700'"
      >
        {{ store.apiErrorModules }}
      </p>

      <p class="mt-2 text-sm text-slate-500">Modules API en erreur.</p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Enregistrements</p>

      <p class="mt-3 text-3xl font-bold text-slate-950">
        {{ store.totalRecords }}
      </p>

      <p class="mt-2 text-sm text-slate-500">Données estimées API + local.</p>
    </article>
  </section>
</template>
