<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
  },
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
    :class="[
      variant === 'primary' && 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      variant === 'success' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      variant === 'warning' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      variant === 'danger' && 'bg-red-50 text-red-700 ring-1 ring-red-200',
      variant === 'emergency' && 'bg-red-100 text-red-900 ring-1 ring-red-300',
      variant === 'neutral' && 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    ]"
  >
    <slot />
  </span>
</template>