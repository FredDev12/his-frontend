<script setup>
import { onMounted, ref } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import NotificationSearchBar from '@/modules/notifications/components/NotificationSearchBar.vue'
import NotificationTable from '@/modules/notifications/components/NotificationTable.vue'

import { useNotificationsStore } from '@/modules/notifications/stores/notifications.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useNotificationsStore()
const toast = useToastStore()

const notificationToRemove = ref(null)
const clearOpen = ref(false)
const removeOpen = ref(false)

onMounted(() => {
  loadNotifications()
  store.connectRealtime()
})

async function loadNotifications(filters = store.filters) {
  try {
    await store.fetchNotifications(filters)
  } catch (error) {
    console.error('[Notifications] Chargement impossible:', error)
    toast.error(error.message || 'Impossible de charger les notifications.')
  }
}

async function search(filters) {
  await loadNotifications(filters)
}

async function resetSearch() {
  store.filters = {
    q: '',
    type: '',
    priority: '',
    read: '',
  }

  await loadNotifications(store.filters)
}

async function markRead(notification) {
  await store.markAsRead(notification.id)
}

async function markAllRead() {
  await store.markAllAsRead()
}

function askClearRead() {
  clearOpen.value = true
}

function closeClear() {
  clearOpen.value = false
}

async function confirmClearRead() {
  await store.clearRead()
  closeClear()
}

function askRemove(notification) {
  notificationToRemove.value = notification
  removeOpen.value = true
}

function closeRemove() {
  notificationToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!notificationToRemove.value?.id) return

  await store.removeNotification(notificationToRemove.value.id)
  closeRemove()
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Notifications</h1>

        <p class="his-page-subtitle">
          Centre de notifications HIS, événements importants et alertes temps réel.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <BaseButton variant="secondary" @click="markAllRead"> Tout marquer lu </BaseButton>

        <BaseButton variant="warning" @click="askClearRead"> Nettoyer les lues </BaseButton>
      </div>
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <article class="his-card p-5">
        <p class="text-sm font-medium text-slate-500">Notifications</p>

        <p class="mt-3 text-3xl font-bold text-slate-950">
          {{ store.notifications.length }}
        </p>
      </article>

      <article class="his-card p-5">
        <p class="text-sm font-medium text-slate-500">Non lues</p>

        <p class="mt-3 text-3xl font-bold text-red-700">
          {{ store.unreadCount }}
        </p>
      </article>

      <article class="his-card p-5">
        <p class="text-sm font-medium text-slate-500">Temps réel</p>

        <p
          class="mt-3 text-lg font-semibold"
          :class="store.connected ? 'text-emerald-700' : 'text-amber-700'"
        >
          {{ store.connected ? 'Connecté' : 'En attente' }}
        </p>
      </article>
    </div>

    <BaseCard>
      <NotificationSearchBar
        :filters="store.filters"
        :loading="store.loading"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <NotificationTable
        :notifications="store.notifications"
        :loading="store.loading"
        @mark-read="markRead"
        @remove="askRemove"
      />
    </BaseCard>

    <ConfirmDialog
      :open="clearOpen"
      title="Supprimer les notifications lues"
      message="Cette action va supprimer uniquement les notifications déjà lues dans le référentiel local."
      confirm-label="Nettoyer les lues"
      cancel-label="Annuler"
      variant="warning"
      @cancel="closeClear"
      @confirm="confirmClearRead"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer cette notification"
      :message="`Cette action va supprimer la notification : ${notificationToRemove?.title || ''}`"
      confirm-label="Supprimer notification"
      cancel-label="Annuler"
      variant="danger"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>
