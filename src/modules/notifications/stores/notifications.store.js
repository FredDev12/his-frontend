import { defineStore } from 'pinia'
import { notificationsService } from '@/modules/notifications/services/notifications.service'
import { useToastStore } from '@/shared/stores/toast.store'

function normalizeNotification(item) {
  if (!item) return null

  return {
    raw: item,

    id: item.id,
    type: item.type || 'INFO',
    priority: item.priority || 'normal',
    title: item.title || 'Notification HIS',
    message: item.message || '',
    module: item.module || 'system',
    entity: item.entity || '',
    entity_id: item.entity_id || '',
    read: Boolean(item.read),
    created_at: item.created_at || '',
    payload: item.payload || {},
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.data || payload?.items || []
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeNotification).filter(Boolean) : []

  return {
    items,
    total: Number(payload?.total || items.length || 0),
  }
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    selectedNotification: null,

    loading: false,
    loadingDetails: false,
    saving: false,
    connected: false,
    realtimeEnabled: false,

    error: '',

    filters: {
      q: '',
      type: '',
      priority: '',
      read: '',
    },
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((item) => !item.read).length,
    latestUnread: (state) => state.notifications.filter((item) => !item.read).slice(0, 5),
  },

  actions: {
    async fetchNotifications(filters = this.filters) {
      this.loading = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        type: filters.type ?? '',
        priority: filters.priority ?? '',
        read: filters.read ?? '',
      }

      try {
        const payload = await notificationsService.list(this.filters)
        const normalized = normalizeListResponse(payload)

        this.notifications = normalized.items

        return normalized
      } catch (error) {
        this.error = error.message || 'Impossible de charger les notifications.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchNotificationById(id) {
      this.loadingDetails = true
      this.error = ''
      this.selectedNotification = null

      try {
        const payload = await notificationsService.getById(id)
        this.selectedNotification = normalizeNotification(payload.data || payload)

        return this.selectedNotification
      } catch (error) {
        this.error = error.message || 'Notification introuvable.'
        throw error
      } finally {
        this.loadingDetails = false
      }
    },

    async addNotification(payload) {
      const response = await notificationsService.create(payload)
      const notification = normalizeNotification(response.data)

      this.notifications = [
        notification,
        ...this.notifications.filter((item) => String(item.id) !== String(notification.id)),
      ]

      return notification
    },

    async markAsRead(id) {
      const response = await notificationsService.markAsRead(id)
      const updated = normalizeNotification(response.data)

      this.notifications = this.notifications.map((item) =>
        String(item.id) === String(id) ? updated : item,
      )

      if (this.selectedNotification && String(this.selectedNotification.id) === String(id)) {
        this.selectedNotification = updated
      }

      return updated
    },

    async markAllAsRead() {
      const toast = useToastStore()

      await notificationsService.markAllAsRead()

      this.notifications = this.notifications.map((item) => ({
        ...item,
        read: true,
      }))

      toast.success('Toutes les notifications sont marquées comme lues.')
    },

    async removeNotification(id) {
      const toast = useToastStore()

      await notificationsService.remove(id)

      this.notifications = this.notifications.filter((item) => String(item.id) !== String(id))

      toast.success('Notification supprimée.')
    },

    async clearRead() {
      const toast = useToastStore()

      await notificationsService.clearRead()

      this.notifications = this.notifications.filter((item) => !item.read)

      toast.success('Notifications lues supprimées.')
    },

    connectRealtime() {
      const toast = useToastStore()

      const result = notificationsService.connectRealtime({
        onConnect: () => {
          this.connected = true
          this.realtimeEnabled = true
        },

        onDisconnect: () => {
          this.connected = false
        },

        onError: () => {
          this.connected = false
          this.realtimeEnabled = true
        },

        onNotification: async (notification) => {
          const normalized = normalizeNotification(notification)

          this.notifications = [
            normalized,
            ...this.notifications.filter((item) => String(item.id) !== String(normalized.id)),
          ]

          if (normalized.priority === 'urgent' || normalized.type === 'EMERGENCY') {
            toast.error(normalized.title)
          } else {
            toast.success(normalized.title)
          }
        },
      })

      this.realtimeEnabled = Boolean(result.enabled)
      this.connected = Boolean(result.connected)
    },

    disconnectRealtime() {
      notificationsService.disconnectRealtime()
      this.connected = false
    },
  },
})
