<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
})

function badgeVariant(notification) {
  const type = String(notification.type || '').toUpperCase()
  const priority = String(notification.priority || '').toLowerCase()

  if (type === 'EMERGENCY' || priority === 'urgent') return 'emergency'
  if (type === 'DANGER') return 'danger'
  if (type === 'WARNING') return 'warning'
  if (type === 'SUCCESS') return 'success'

  return 'primary'
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="font-semibold text-slate-950">Notifications récentes</h2>

        <p class="mt-1 text-sm text-slate-500">Derniers événements reçus par le HIS.</p>
      </div>

      <RouterLink to="/notifications">
        <BaseButton variant="secondary" size="sm"> Tout voir </BaseButton>
      </RouterLink>
    </div>

    <div class="mt-5 space-y-3">
      <div
        v-if="notifications.length === 0"
        class="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500"
      >
        Aucune notification récente.
      </div>

      <RouterLink
        v-for="item in notifications"
        v-else
        :key="item.id"
        :to="`/notifications/${item.id}`"
        class="block rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-950">
              {{ item.title }}
            </p>

            <p class="mt-1 line-clamp-2 text-sm text-slate-500">
              {{ item.message || '—' }}
            </p>

            <p class="mt-2 text-xs text-slate-400">
              {{ formatDateTime(item.created_at) }}
            </p>
          </div>

          <BaseBadge :variant="badgeVariant(item)">
            {{ item.read ? 'Lue' : 'Non lue' }}
          </BaseBadge>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
