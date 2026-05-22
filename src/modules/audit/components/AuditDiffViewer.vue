<script setup>
defineProps({
  oldValue: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null,
  },
  newValue: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null,
  },
})

function stringify(value) {
  if (value === null || value === undefined || value === '') return '—'

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}
</script>

<template>
  <section class="grid gap-6 xl:grid-cols-2">
    <div class="his-card p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-slate-950">Ancienne valeur</h2>

          <p class="mt-1 text-sm text-slate-500">État des données avant l’action auditée.</p>
        </div>

        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Avant
        </span>
      </div>

      <pre
        class="mt-4 max-h-[480px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700"
        >{{ stringify(oldValue) }}</pre
      >
    </div>

    <div class="his-card p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-slate-950">Nouvelle valeur</h2>

          <p class="mt-1 text-sm text-slate-500">État des données après l’action auditée.</p>
        </div>

        <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Après
        </span>
      </div>

      <pre
        class="mt-4 max-h-[480px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700"
        >{{ stringify(newValue) }}</pre
      >
    </div>
  </section>
</template>
