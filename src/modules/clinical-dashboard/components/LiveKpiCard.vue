<script setup>
defineProps({
  card: { type: Object, required: true },
})
</script>

<template>
  <div
    class="rounded-2xl border p-5"
    :class="{
      'border-blue-200 bg-blue-50 text-blue-950': card.variant === 'primary',
      'border-emerald-200 bg-emerald-50 text-emerald-950': card.variant === 'success',
      'border-amber-200 bg-amber-50 text-amber-950': card.variant === 'warning',
      'border-rose-200 bg-rose-50 text-rose-950': card.variant === 'danger',
      'border-red-300 bg-red-50 text-red-950': card.variant === 'emergency',
    }"
  >
    <p class="text-sm font-medium opacity-80">{{ card.label }}</p>

    <p class="mt-2 text-3xl font-bold">
      {{ card.value ?? 0 }}{{ card.suffix || "" }}
    </p>

    <p class="mt-1 text-sm opacity-80">
      {{ card.description || "—" }}
    </p>
  </div>
</template>
