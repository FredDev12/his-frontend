<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Array,
    default: () => []
  },
  emptyText: {
    type: String,
    default: "Aucune donnée disponible."
  }
});
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length || 1" class="px-4 py-8 text-center text-slate-500">
              {{ emptyText }}
            </td>
          </tr>

          <tr v-for="row in rows" :key="row.id ?? row.uuid" class="hover:bg-slate-50">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-slate-700"
            >
              <slot :name="`cell-${column.key}`" :row="row">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
