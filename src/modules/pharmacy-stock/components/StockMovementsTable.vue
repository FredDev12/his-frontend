<script setup>
import StockMovementTypeBadge from '@/modules/pharmacy-stock/components/StockMovementTypeBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  movements: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Date
          </th>
          <th
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Type
          </th>
          <th
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Quantité
          </th>
          <th
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Stock après
          </th>
          <th
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Motif
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="movements.length === 0">
          <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucun mouvement stock.
          </td>
        </tr>

        <tr v-for="movement in movements" v-else :key="movement.id">
          <td class="px-4 py-4 text-sm text-slate-600">
            {{ formatDateTime(movement.created_at) }}
          </td>

          <td class="px-4 py-4">
            <StockMovementTypeBadge :type="movement.type" />
          </td>

          <td class="px-4 py-4 font-semibold text-slate-950">
            {{ movement.quantity }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ movement.stock_after }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ movement.reason || '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
