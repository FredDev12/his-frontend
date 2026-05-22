<script setup>
const props = defineProps({
  status: {
    type: String,
    default: '',
  },
})

const label =
  {
    active: 'Actif',
    inactive: 'Inactive',
  }[props.status] || 'Inconnu'

const classes =
  {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-100 text-slate-700',
    default: 'bg-slate-100 text-slate-700',
  }[props.status] || 'bg-slate-100 text-slate-700'
</script>

<template>
  <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="classes">{{
    label
  }}</span>
</template>
