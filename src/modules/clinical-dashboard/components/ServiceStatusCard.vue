<script setup>
defineProps({
  service: { type: Object, required: true },
})
</script>

<template>
  <div
    class="rounded-2xl border p-5"
    :class="{
      'border-emerald-200 bg-emerald-50 text-emerald-950': service.variant === 'success',
      'border-amber-200 bg-amber-50 text-amber-950': service.variant === 'warning',
      'border-red-300 bg-red-50 text-red-950': service.variant === 'emergency',
      'border-rose-200 bg-rose-50 text-rose-950': service.variant === 'danger',
    }"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium opacity-80">Service</p>
        <h3 class="mt-1 text-base font-semibold">
          {{ service.service || "Service non renseigné" }}
        </h3>
      </div>

      <span class="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">
        {{ service.status || "NORMAL" }}
      </span>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3 text-sm">
      <div>
        <p class="opacity-70">Patients</p>
        <p class="text-lg font-bold">{{ service.patients || 0 }}</p>
      </div>

      <div>
        <p class="opacity-70">Attente</p>
        <p class="text-lg font-bold">{{ service.waiting || 0 }}</p>
      </div>

      <div>
        <p class="opacity-70">Occupation</p>
        <p class="text-lg font-bold">{{ service.occupancy || 0 }}%</p>
      </div>
    </div>
  </div>
</template>
