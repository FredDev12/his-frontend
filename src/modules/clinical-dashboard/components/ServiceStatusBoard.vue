<script setup>
import ServiceStatusCard from "@/modules/clinical-dashboard/components/ServiceStatusCard.vue"

defineProps({
  services: { type: Array, default: () => [] },
  generatedAt: { type: String, default: "" },
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">État des services</h2>
        <p class="text-sm text-slate-500">
          Vue opérationnelle par service : charge, attente et occupation.
        </p>
      </div>

      <p v-if="generatedAt" class="text-xs text-slate-400">
        Mise à jour : {{ generatedAt }}
      </p>
    </div>

    <div
      v-if="services.length === 0"
      class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
    >
      Aucun service chargé.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ServiceStatusCard
        v-for="service in services"
        :key="service.id || service.service"
        :service="service"
      />
    </div>
  </section>
</template>
