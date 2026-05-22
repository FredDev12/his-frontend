<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import { useNotificationsStore } from '@/modules/notifications/stores/notifications.store'
import { formatDateTime } from '@/shared/utils/date'

const store = useNotificationsStore()
const open = ref(false)

const unreadCount = computed(() => store.unreadCount)
const latestUnread = computed(() => store.latestUnread)

onMounted(async () => {
  await store.fetchNotifications()
  store.connectRealtime()
})

function toggle() {
  open.value = !open.value
}

async function markAllRead() {
  await store.markAllAsRead()
  open.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      @click="toggle"
    >
      <span class="text-lg">🔔</span>

      <span
        v-if="unreadCount"
        class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p class="font-semibold text-slate-950">Notifications</p>

          <p class="text-xs text-slate-500">{{ unreadCount }} non lue(s)</p>
        </div>

        <button
          v-if="unreadCount"
          type="button"
          class="text-xs font-medium text-blue-700 hover:text-blue-900"
          @click="markAllRead"
        >
          Tout lire
        </button>
      </div>

      <div class="max-h-96 overflow-auto">
        <div v-if="latestUnread.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">
          Aucune notification non lue.
        </div>

        <RouterLink
          v-for="item in latestUnread"
          :key="item.id"
          :to="`/notifications/${item.id}`"
          class="block border-b border-slate-100 px-4 py-3 hover:bg-slate-50"
          @click="open = false"
        >
          <p class="text-sm font-semibold text-slate-950">
            {{ item.title }}
          </p>

          <p class="mt-1 line-clamp-2 text-xs text-slate-500">
            {{ item.message || '—' }}
          </p>

          <p class="mt-2 text-xs text-slate-400">
            {{ formatDateTime(item.created_at) }}
          </p>
        </RouterLink>
      </div>

      <div class="border-t border-slate-100 p-3">
        <RouterLink to="/notifications" @click="open = false">
          <BaseButton variant="secondary" class="w-full"> Voir toutes </BaseButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
