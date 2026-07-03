<script setup>
import IntelligentAlertCard from "@/modules/clinical-dashboard/components/IntelligentAlertCard.vue"

defineProps({
  alerts: { type: Array, default: () => [] },
  criticalCount: { type: Number, default: 0 },
  warningCount: { type: Number, default: 0 },
  generatedAt: { type: String, default: "" },
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Alertes intelligentes</h2>
        <p class="text-sm text-slate-500">
          Détection automatique des situations nécessitant une attention.
        </p>
      </div>

      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
          Critiques : {{ criticalCount }}
        </span>
        <span class="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
          Avertissements : {{ warningCount }}
        </span>
        <span v-if="generatedAt" class="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
          {{ generatedAt }}
        </span>
      </div>
    </div>

    <div
      v-if="alerts.length === 0"
      class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
    >
      Aucune alerte intelligente chargée.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <IntelligentAlertCard
        v-for="alert in alerts"
        :key="alert.id"
        :alert="alert"
      />
    </div>
  </section>
</template>
