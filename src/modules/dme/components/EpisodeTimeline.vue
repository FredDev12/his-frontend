<script setup>
defineProps({
  events: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="space-y-3">
    <div v-if="events.length === 0" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
      Aucun événement clinique chargé.
    </div>

    <div
      v-for="event in events"
      :key="event.id || event.createdAt || event.label"
      class="rounded-2xl border border-slate-200 bg-white p-4"
    >
      <div class="flex flex-col justify-between gap-2 sm:flex-row">
        <div>
          <p class="font-semibold text-slate-950">
            {{ event.title || event.label || event.action || "Événement clinique" }}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            {{ event.description || event.message || event.commentaire || "—" }}
          </p>
        </div>

        <p class="text-xs font-medium text-slate-400">
          {{ event.createdAt || event.created_at || event.date || "—" }}
        </p>
      </div>
    </div>
  </div>
</template>
