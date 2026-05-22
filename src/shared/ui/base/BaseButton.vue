<script setup>
import Spinner from '@/shared/ui/feedback/Spinner.vue'

defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'md',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition his-focus disabled:cursor-not-allowed disabled:opacity-60"
    :class="[
      size === 'sm' && 'px-3 py-2 text-xs',
      size === 'md' && 'px-4 py-2.5 text-sm',
      size === 'lg' && 'px-5 py-3 text-base',

      variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
      variant === 'secondary' && 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
      variant === 'success' && 'bg-emerald-600 text-white hover:bg-emerald-700',
      variant === 'warning' && 'bg-amber-600 text-white hover:bg-amber-700',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
      variant === 'emergency' && 'bg-red-800 text-white hover:bg-red-900',
      variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
    ]"
  >
    <Spinner v-if="loading" size="sm" />
    <slot />
  </button>
</template>