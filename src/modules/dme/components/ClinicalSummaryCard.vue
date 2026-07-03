<script setup>
defineProps({
  summary: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <div class="his-card p-5">
      <p class="text-sm text-slate-500">Diagnostic principal</p>
      <p class="mt-2 font-semibold text-slate-950">{{ summary.diagnostic || "—" }}</p>
    </div>

    <div class="his-card p-5">
      <p class="text-sm text-slate-500">Allergies</p>
      <p class="mt-2 font-semibold text-slate-950">{{ summary.allergies || "—" }}</p>
    </div>

    <div class="his-card p-5">
      <p class="text-sm text-slate-500">Dernière consultation</p>
      <p class="mt-2 font-semibold text-slate-950">{{ summary.lastConsultation || "—" }}</p>
    </div>

    <div class="his-card p-5">
      <p class="text-sm text-slate-500">Hospitalisation active</p>
      <p class="mt-2 font-semibold text-slate-950">{{ summary.hospitalisationActive || "—" }}</p>
    </div>
  </section>
</template>
