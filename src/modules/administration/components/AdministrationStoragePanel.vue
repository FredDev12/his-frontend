<script setup>
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

defineProps({
  modules: {
    type: Array,
    default: () => [],
  },
})

function totalSize(modules) {
  return modules.reduce((sum, item) => sum + Number(item.size || 0), 0)
}

function formatSize(size) {
  const value = Number(size || 0)

  if (value < 1024) return `${value} o`
  return `${(value / 1024).toFixed(1)} Ko`
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <h2 class="font-semibold text-slate-950">Référentiels frontend</h2>

        <p class="mt-1 text-sm text-slate-500">Modules temporaires sauvegardés côté navigateur.</p>
      </div>

      <BaseBadge variant="neutral">
        {{ formatSize(totalSize(modules)) }}
      </BaseBadge>
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="module in modules"
        :key="module.key"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <p class="font-semibold text-slate-950">
          {{ module.label }}
        </p>

        <p class="mt-1 text-xs text-slate-500">
          {{ module.storageKey }}
        </p>

        <div class="mt-3 flex items-center justify-between gap-3">
          <BaseBadge :variant="module.status === 'available' ? 'success' : 'warning'">
            {{ module.total }} élément(s)
          </BaseBadge>

          <span class="text-xs text-slate-400">
            {{ formatSize(module.size) }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>
