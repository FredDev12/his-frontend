<script setup>
defineProps({
  item: { type: Object, required: true },
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-slate-500">Service</p>
        <h3 class="mt-1 text-base font-semibold text-slate-950">
          {{ item.service || "Service" }}
        </h3>
      </div>

      <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
        {{ item.occupancy || 0 }}%
      </span>
    </div>

    <p class="mt-4 text-2xl font-bold text-slate-950">
      {{ item.occupied || 0 }} / {{ item.capacity || 0 }}
    </p>

    <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-full rounded-full bg-slate-900"
        :style="{ width: `${Math.min(Number(item.occupancy || 0), 100)}%` }"
      />
    </div>

    <p class="mt-2 text-sm text-slate-500">
      {{ item.available || 0 }} lit(s) libre(s)
    </p>
  </div>
</template>
