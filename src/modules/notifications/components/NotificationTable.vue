<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import NotificationTypeBadge from '@/modules/notifications/components/NotificationTypeBadge.vue'
import NotificationPriorityBadge from '@/modules/notifications/components/NotificationPriorityBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['mark-read', 'remove'])
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Notification
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Type
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Priorité
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Module
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Date
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des notifications...
            </td>
          </tr>

          <tr v-else-if="notifications.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucune notification trouvée.
            </td>
          </tr>

          <tr
            v-for="notification in notifications"
            v-else
            :key="notification.id"
            :class="['hover:bg-slate-50', !notification.read ? 'bg-blue-50/40' : '']"
          >
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ notification.title }}
              </p>

              <p class="mt-1 line-clamp-2 text-sm text-slate-500">
                {{ notification.message || '—' }}
              </p>

              <p v-if="!notification.read" class="mt-1 text-xs font-semibold text-blue-700">
                Non lue
              </p>
            </td>

            <td class="px-4 py-4">
              <NotificationTypeBadge :type="notification.type" />
            </td>

            <td class="px-4 py-4">
              <NotificationPriorityBadge :priority="notification.priority" />
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ notification.module || '—' }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ formatDateTime(notification.created_at) }}
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/notifications/${notification.id}`">
                  <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
                </RouterLink>

                <BaseButton
                  v-if="!notification.read"
                  variant="secondary"
                  size="sm"
                  @click="$emit('mark-read', notification)"
                >
                  Marquer lu
                </BaseButton>

                <BaseButton variant="danger" size="sm" @click="$emit('remove', notification)">
                  Supprimer
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
