<script setup>
defineProps({
  status: { type: String, default: "" },
})
</script>

<template>
  <span class="rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="{
      'bg-emerald-50 text-emerald-700': ['ACTIVE', 'ADMISE', 'EN_COURS'].includes(String(status).toUpperCase()),
      'bg-slate-100 text-slate-700': ['DISCHARGED', 'SORTIE'].includes(String(status).toUpperCase()),
      'bg-amber-50 text-amber-700': !status,
    }"
  >
    {{ status || "—" }}
  </span>
</template>
