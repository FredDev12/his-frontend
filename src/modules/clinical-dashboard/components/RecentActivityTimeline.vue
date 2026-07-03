<script setup>
defineProps({
  events: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 class="mb-4 text-base font-semibold text-slate-950">Activités récentes</h2>

    <p v-if="events.length === 0" class="text-sm text-slate-500">
      Aucune activité récente chargée.
    </p>

    <div
      v-for="event in events"
      :key="event.id"
      class="mb-4 border-l-2 border-blue-600 pl-4 last:mb-0"
    >
      <p class="text-sm font-semibold text-slate-950">{{ event.type || "Événement" }}</p>
      <p class="text-sm text-slate-600">{{ event.patient || "Patient" }}</p>
      <p class="text-xs text-slate-500">{{ event.service || "Service non renseigné" }}</p>
      <p class="text-xs text-slate-400">{{ event.createdAt || "—" }}</p>
    </div>
  </div>
</template>
