<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  description: { type: String, default: "" },
  variant: { type: String, default: "warning" },
})
</script>

<template>
  <div
    class="rounded-2xl border p-5"
    :class="{
      'border-amber-200 bg-amber-50 text-amber-900': variant === 'warning',
      'border-rose-200 bg-rose-50 text-rose-900': variant === 'danger',
      'border-red-300 bg-red-50 text-red-900': variant === 'emergency',
      'border-slate-200 bg-white text-slate-900': variant === 'neutral',
    }"
  >
    <p class="text-sm font-medium">{{ title }}</p>
    <p class="mt-2 text-3xl font-bold">{{ value }}</p>
    <p v-if="description" class="mt-1 text-sm opacity-80">{{ description }}</p>
  </div>
</template>
