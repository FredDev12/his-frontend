<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "success", "warning", "danger", "emergency", "ghost"].includes(value)
  },
  type: {
    type: String,
    default: "button"
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
  warning: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  emergency: "bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-600",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300"
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    :class="variantClasses[variant]"
  >
    <slot />
  </button>
</template>
