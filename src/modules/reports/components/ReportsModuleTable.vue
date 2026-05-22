<script setup>
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

defineProps({
  modules: {
    type: Array,
    default: () => [],
  },
})

function percent(value, total) {
  const number = Number(value || 0)
  const base = Number(total || 0)

  if (!base) return 0

  return Math.min(100, Math.round((number / base) * 100))
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Module
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Total
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Avancement
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Observation
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="modules.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun indicateur disponible.
            </td>
          </tr>

          <tr v-for="item in modules" v-else :key="item.key" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ item.label }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ item.description }}
              </p>
            </td>

            <td class="px-4 py-4">
              <BaseBadge variant="primary">
                {{ item.total }}
              </BaseBadge>
            </td>

            <td class="px-4 py-4">
              <div class="h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-blue-600"
                  :style="{ width: `${percent(item.done || item.total, item.total || 1)}%` }"
                />
              </div>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              <span v-if="item.alert" class="font-medium text-red-600">
                {{ item.alert }} élément(s) urgent(s)
              </span>

              <span v-else-if="item.pending" class="font-medium text-amber-600">
                {{ item.pending }} en attente
              </span>

              <span v-else> Stable </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
