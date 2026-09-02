<script setup>
defineProps({
  stats: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

function entries(value) {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value)
}

function dash(value) {
  return value || '—'
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement des statistiques agents...
    </div>

    <template v-else-if="stats">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article class="his-card p-5">
          <p class="text-sm font-medium text-slate-500">Total agents</p>
          <p class="mt-3 text-3xl font-bold text-slate-950">
            {{ stats.total || '—' }}
          </p>
        </article>

        <article class="his-card p-5">
          <p class="text-sm font-medium text-slate-500">Sites</p>
          <p class="mt-3 text-3xl font-bold text-slate-950">
            {{ entries(stats.par_site).length }}
          </p>
        </article>

        <article class="his-card p-5">
          <p class="text-sm font-medium text-slate-500">Fonctions</p>
          <p class="mt-3 text-3xl font-bold text-slate-950">
            {{ entries(stats.par_fonction).length }}
          </p>
        </article>

      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="his-card p-5">
          <h2 class="font-semibold text-slate-950">Répartition par site</h2>

          <div class="mt-4 space-y-3">
            <div
              v-for="[label, count] in entries(stats.par_site)"
              :key="label"
              class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span class="font-medium text-slate-700">{{ dash(label) }}</span>
              <span class="font-semibold text-slate-950">{{ count }}</span>
            </div>
          </div>
        </section>

        <section class="his-card p-5">
          <h2 class="font-semibold text-slate-950">Répartition par fonction</h2>

          <div class="mt-4 space-y-3">
            <div
              v-for="[label, count] in entries(stats.par_fonction)"
              :key="label"
              class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span class="font-medium text-slate-700">{{ dash(label) }}</span>
              <span class="font-semibold text-slate-950">{{ count }}</span>
            </div>
          </div>
        </section>

        <section class="his-card p-5">
          <h2 class="font-semibold text-slate-950">Répartition par sexe</h2>

          <div class="mt-4 space-y-3">
            <div
              v-for="[label, count] in entries(stats.par_sexe)"
              :key="label"
              class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span class="font-medium text-slate-700">{{ dash(label) }}</span>
              <span class="font-semibold text-slate-950">{{ count }}</span>
            </div>
          </div>
        </section>

      </div>
    </template>

    <div v-else class="his-card p-8 text-center text-sm text-slate-500">
      Aucune statistique disponible.
    </div>
  </div>
</template>
