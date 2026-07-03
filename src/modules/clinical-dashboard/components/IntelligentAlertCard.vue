<script setup>
defineProps({
  alert: { type: Object, required: true },
})
</script>

<template>
  <RouterLink
    :to="alert.route || '/command-center'"
    class="block rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    :class="{
      'border-emerald-200 bg-emerald-50 text-emerald-950': alert.variant === 'success',
      'border-amber-200 bg-amber-50 text-amber-950': alert.variant === 'warning',
      'border-rose-200 bg-rose-50 text-rose-950': alert.variant === 'danger',
      'border-red-300 bg-red-50 text-red-950': alert.variant === 'emergency',
    }"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-bold uppercase tracking-wide opacity-70">
          {{ alert.service || "Centre de Commande" }}
        </p>

        <h3 class="mt-1 text-base font-semibold">
          {{ alert.title || "Alerte" }}
        </h3>
      </div>

      <span class="rounded-full bg-white/70 px-2 py-1 text-xs font-bold uppercase">
        {{ alert.level || "info" }}
      </span>
    </div>

    <p class="mt-3 text-sm opacity-90">
      {{ alert.message || "—" }}
    </p>

    <p class="mt-4 text-sm font-semibold">
      {{ alert.action || "Voir" }}
    </p>

    <p class="mt-2 text-xs opacity-60">
      {{ alert.generatedAt || "—" }}
    </p>
  </RouterLink>
</template>
