<script setup>
import OccupancyCard from "@/modules/clinical-dashboard/components/OccupancyCard.vue"

defineProps({
  occupancy: {
    type: Object,
    default: () => ({
      services: [],
      summary: {
        occupied: 0,
        capacity: 0,
        available: 0,
        occupancy: 0,
      },
    }),
  },
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Occupation hospitalière</h2>
        <p class="text-sm text-slate-500">
          Suivi des services et lits actuellement occupés.
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span class="font-semibold text-slate-950">
          {{ occupancy.summary?.occupied || 0 }} / {{ occupancy.summary?.capacity || 0 }}
        </span>
        <span class="text-slate-500">
          · {{ occupancy.summary?.occupancy || 0 }}%
        </span>
      </div>
    </div>

    <div v-if="!occupancy.services || occupancy.services.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Aucune occupation hospitalière chargée.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <OccupancyCard
        v-for="item in occupancy.services"
        :key="item.id || item.service"
        :item="item"
      />
    </div>
  </section>
</template>
