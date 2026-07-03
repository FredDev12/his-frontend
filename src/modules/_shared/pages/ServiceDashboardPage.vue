<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ""
  },
  serviceKey: {
    type: String,
    required: true
  }
});
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Dashboard service
      </p>
      <h1 class="mt-2 text-2xl font-bold text-slate-950">
        {{ title }}
      </h1>
      <p class="mt-2 max-w-3xl text-sm text-slate-600">
        {{ subtitle }}
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold text-slate-500">Statut</p>
        <p class="mt-2 text-xl font-bold text-slate-950">Prêt</p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold text-slate-500">Service</p>
        <p class="mt-2 text-xl font-bold text-slate-950">{{ serviceKey }}</p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold text-slate-500">Sécurité</p>
        <p class="mt-2 text-xl font-bold text-slate-950">RBAC UX</p>
      </div>
    </div>
  </section>
</template>
