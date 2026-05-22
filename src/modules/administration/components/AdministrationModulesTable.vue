<script setup>
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  modules: {
    type: Array,
    default: () => [],
  },
})

function badgeVariant(status) {
  if (status === 'online' || status === 'available') return 'success'
  if (status === 'empty') return 'warning'
  if (status === 'error') return 'danger'
  return 'neutral'
}

function statusLabel(status) {
  const labels = {
    online: 'Disponible',
    available: 'Disponible',
    empty: 'Non initialisé',
    error: 'Erreur',
  }

  return labels[status] || status || 'Inconnu'
}

function formatSize(size) {
  const value = Number(size || 0)

  if (value < 1024) return `${value} o`
  return `${(value / 1024).toFixed(1)} Ko`
}
</script>

<template>
  <section class="his-card p-5">
    <div>
      <h2 class="font-semibold text-slate-950">
        {{ title }}
      </h2>

      <p v-if="subtitle" class="mt-1 text-sm text-slate-500">
        {{ subtitle }}
      </p>
    </div>

    <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
              Source
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Statut
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Données
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Vérifié le
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="modules.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun module à afficher.
            </td>
          </tr>

          <tr v-for="module in modules" v-else :key="module.key" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ module.label }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                {{ module.endpoint || module.storageKey || '—' }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ module.type }}
            </td>

            <td class="px-4 py-4">
              <BaseBadge :variant="badgeVariant(module.status)">
                {{ statusLabel(module.status) }}
              </BaseBadge>

              <p v-if="module.message" class="mt-1 text-xs text-slate-500">
                {{ module.message }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              <span>{{ module.total }} élément(s)</span>

              <span v-if="module.size" class="ml-2 text-xs text-slate-400">
                · {{ formatSize(module.size) }}
              </span>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ formatDateTime(module.checked_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
