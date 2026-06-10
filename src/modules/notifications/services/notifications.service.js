import { io } from 'socket.io-client'

const STORAGE_KEY = 'his_notifications'

let socket = null

function now() {
  return new Date().toISOString()
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function readStorage() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    return []
  }
}

function writeStorage(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function normalizeType(value) {
  const type = String(value || '').toUpperCase()

  const map = {
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    WARNING: 'WARNING',
    DANGER: 'DANGER',
    ERROR: 'DANGER',
    EMERGENCY: 'EMERGENCY',
    URGENCE: 'EMERGENCY',
  }

  return map[type] || 'INFO'
}

function normalizePriority(value) {
  const priority = String(value || '').toLowerCase()

  const map = {
    low: 'low',
    normal: 'normal',
    medium: 'normal',
    high: 'high',
    urgent: 'urgent',
    emergency: 'urgent',
  }

  return map[priority] || 'normal'
}

function normalizeNotification(payload = {}) {
  const raw = payload || {}

  return {
    id: raw.id || raw.notification_id || raw.notificationId || generateId(),

    type: normalizeType(raw.type || raw.variant || raw.level),
    priority: normalizePriority(raw.priority || raw.priorite || raw.severity),

    title: raw.title || raw.titre || 'Notification HIS',
    message: raw.message || raw.description || raw.body || '',

    module: raw.module || raw.source || 'system',
    entity: raw.entity || raw.entite || '',
    entity_id: raw.entity_id || raw.entityId || raw.record_id || raw.recordId || '',

    read: Boolean(raw.read || raw.lu || false),

    created_at: raw.created_at || raw.createdAt || raw.timestamp || now(),
    payload: raw.payload || raw.data || raw,
  }
}

function addNotification(payload) {
  const notification = normalizeNotification(payload)
  const items = readStorage()

  const exists = items.some((item) => String(item.id) === String(notification.id))

  if (!exists) {
    items.unshift(notification)
    writeStorage(items.slice(0, 200))
  }

  return notification
}

function mapSocketEvent(eventName, payload = {}) {
  const maps = {
    'admission:new': {
      type: 'INFO',
      priority: 'normal',
      title: 'Nouvelle admission',
      module: 'receptions',
    },
    'triage:urgent': {
      type: 'EMERGENCY',
      priority: 'urgent',
      title: 'Patient urgent au triage',
      module: 'triage',
    },
    'laboratoire:result': {
      type: 'SUCCESS',
      priority: 'normal',
      title: 'Résultat laboratoire disponible',
      module: 'laboratoire',
    },
    'paiement:validated': {
      type: 'SUCCESS',
      priority: 'normal',
      title: 'Paiement validé',
      module: 'caisse',
    },
    'sortie:validated': {
      type: 'SUCCESS',
      priority: 'normal',
      title: 'Sortie patient validée',
      module: 'sorties',
    },
  }

  return {
    ...maps[eventName],
    ...payload,
  }
}

export const notificationsService = {
  async list(filters = {}) {
    const q = String(filters.q || '')
      .toLowerCase()
      .trim()
    const type = String(filters.type || '').toUpperCase()
    const priority = String(filters.priority || '').toLowerCase()
    const readFilter = filters.read

    const items = readStorage().filter((item) => {
      const searchable = [
        item.title,
        item.message,
        item.module,
        item.entity,
        item.entity_id,
        item.type,
        item.priority,
      ]
        .join(' ')
        .toLowerCase()

      const matchesQ = !q || searchable.includes(q)
      const matchesType = !type || item.type === type
      const matchesPriority = !priority || item.priority === priority

      const matchesRead =
        readFilter === '' ||
        readFilter === undefined ||
        readFilter === null ||
        String(item.read) === String(readFilter)

      return matchesQ && matchesType && matchesPriority && matchesRead
    })

    return {
      data: items,
      total: items.length,
    }
  },

  async getById(id) {
    const item = readStorage().find((notification) => String(notification.id) === String(id))

    if (!item) {
      throw new Error('Notification introuvable.')
    }

    return {
      data: item,
    }
  },

  async create(payload) {
    const notification = addNotification(payload)

    return {
      data: notification,
    }
  },

  async markAsRead(id) {
    const items = readStorage().map((item) =>
      String(item.id) === String(id) ? { ...item, read: true } : item,
    )

    writeStorage(items)

    return {
      data: items.find((item) => String(item.id) === String(id)),
    }
  },

  async markAllAsRead() {
    const items = readStorage().map((item) => ({
      ...item,
      read: true,
    }))

    writeStorage(items)

    return {
      data: items,
    }
  },

  async remove(id) {
    const items = readStorage().filter((item) => String(item.id) !== String(id))
    writeStorage(items)

    return {
      message: 'Notification supprimée.',
    }
  },

  async clearRead() {
    const items = readStorage().filter((item) => !item.read)
    writeStorage(items)

    return {
      data: items,
    }
  },

  connectRealtime({ onNotification, onConnect, onDisconnect, onError } = {}) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL

    if (!socketUrl) {
      return {
        enabled: false,
        connected: false,
        reason: 'VITE_SOCKET_URL non défini.',
      }
    }

    if (socket?.connected) {
      return {
        enabled: true,
        connected: true,
      }
    }

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socket.on('connect', () => {
      onConnect?.()
    })

    socket.on('disconnect', () => {
      onDisconnect?.()
    })

    socket.on('connect_error', (error) => {
      onError?.(error)
    })

    socket.on('notification', (payload) => {
      const notification = addNotification(payload)
      onNotification?.(notification)
    })

    socket.on('his:notification', (payload) => {
      const notification = addNotification(payload)
      onNotification?.(notification)
    })

    const mappedEvents = [
      'admission:new',
      'triage:urgent',
      'laboratoire:result',
      'paiement:validated',
      'sortie:validated',
    ]

    mappedEvents.forEach((eventName) => {
      socket.on(eventName, (payload) => {
        const notification = addNotification(mapSocketEvent(eventName, payload))
        onNotification?.(notification)
      })
    })

    return {
      enabled: true,
      connected: socket.connected,
    }
  },

  disconnectRealtime() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },
}
