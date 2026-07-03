<script setup>
import LiveKpiCard from "@/modules/clinical-dashboard/components/LiveKpiCard.vue"

defineProps({
  cards: { type: Array, default: () => [] },
  generatedAt: { type: String, default: "" },
})
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">KPI temps réel</h2>
        <p class="text-sm text-slate-500">
          Indicateurs opérationnels du Centre de Commande Hospitalier.
        </p>
      </div>

      <p v-if="generatedAt" class="text-xs text-slate-400">
        Dernière mise à jour : {{ generatedAt }}
      </p>
    </div>

    <div v-if="cards.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
      Aucun KPI chargé.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <LiveKpiCard
        v-for="card in cards"
        :key="card.key"
        :card="card"
      />
    </div>
  </section>
</template>
