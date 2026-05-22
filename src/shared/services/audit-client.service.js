import api from '@/shared/services/api'

const LOCAL_AUDIT_EVENTS_KEY = 'his_audit_events'
const MAX_LOCAL_AUDIT_EVENTS = 1000

function now() {
  return new Date().toISOString()
}

function generateRequestId() {
  return `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function getCurrentUser() {
  const storedUser =
    localStorage.getItem('his_user') ||
    localStorage.getItem('user') ||
    sessionStorage.getItem('his_user') ||
    sessionStorage.getItem('user')

  const user = storedUser ? safeJsonParse(storedUser, {}) : {}

  return {
    userId: user?.id || user?.userId || user?.user_id || null,
    role: user?.role || user?.profil || user?.type || 'unknown',
    email: user?.email || '',
    name: [user?.nom, user?.postnom, user?.prenom, user?.name].filter(Boolean).join(' ').trim(),
  }
}

function readLocalAuditEvents() {
  const stored = localStorage.getItem(LOCAL_AUDIT_EVENTS_KEY)

  if (!stored) {
    localStorage.setItem(LOCAL_AUDIT_EVENTS_KEY, JSON.stringify([]))
    return []
  }

  const parsed = safeJsonParse(stored, [])

  return Array.isArray(parsed) ? parsed : []
}

function writeLocalAuditEvents(items) {
  localStorage.setItem(
    LOCAL_AUDIT_EVENTS_KEY,
    JSON.stringify(items.slice(0, MAX_LOCAL_AUDIT_EVENTS)),
  )
}

function redactSensitiveValue(value) {
  if (!value || typeof value !== 'object') return value

  const sensitiveKeys = [
    'password',
    'mot_de_passe',
    'motdepasse',
    'token',
    'access_token',
    'refresh_token',
    'authorization',
    'cookie',
    'secret',
    'csrf',
  ]

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValue(item))
  }

  return Object.entries(value).reduce((result, [key, itemValue]) => {
    const normalizedKey = String(key).toLowerCase()

    if (sensitiveKeys.some((sensitiveKey) => normalizedKey.includes(sensitiveKey))) {
      result[key] = '[REDACTED]'
      return result
    }

    result[key] = redactSensitiveValue(itemValue)
    return result
  }, {})
}

function normalizeAuditPayload(payload = {}) {
  const currentUser = getCurrentUser()
  const timestamp = payload.timestamp || now()

  return {
    id: payload.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

    userId: payload.userId ?? currentUser.userId,
    role: payload.role || currentUser.role,
    userEmail: payload.userEmail || currentUser.email,
    userName: payload.userName || currentUser.name,

    action: payload.action || 'UNKNOWN_ACTION',
    entity: payload.entity || payload.module || 'unknown',
    entityId: payload.entityId || payload.entity_id || null,

    numero_fiche: payload.numero_fiche || payload.numeroFiche || '',
    numero_patient: payload.numero_patient || payload.numeroPatient || '',
    patient: payload.patient || '',

    oldValue: redactSensitiveValue(payload.oldValue || payload.old_value || null),
    newValue: redactSensitiveValue(payload.newValue || payload.new_value || null),

    details: redactSensitiveValue(payload.details || {}),

    ip: payload.ip || 'frontend-unknown',
    userAgent: payload.userAgent || navigator.userAgent || 'unknown',
    requestId: payload.requestId || generateRequestId(),

    source: payload.source || 'his-web',
    auditLevel: payload.auditLevel || payload.audit_level || 'INFO',

    synced: Boolean(payload.synced),
    sync_status: payload.sync_status || 'pending',

    timestamp,
    createdAt: timestamp,
  }
}

function saveLocalAuditEvent(payload) {
  const events = readLocalAuditEvents()
  const event = normalizeAuditPayload(payload)

  events.unshift(event)
  writeLocalAuditEvents(events)

  return event
}

export const auditClientService = {
  auditLocal(payload = {}) {
    return saveLocalAuditEvent(payload)
  },

  async auditBackend(payload = {}) {
    const auditPayload = normalizeAuditPayload(payload)

    const response = await api.post('/audit', auditPayload)

    return response.data
  },

  async auditSafe(payload = {}) {
    const localEvent = saveLocalAuditEvent(payload)

    try {
      await api.post('/audit', {
        ...localEvent,
        synced: undefined,
        sync_status: undefined,
      })

      const events = readLocalAuditEvents()
      const updatedEvents = events.map((event) =>
        event.id === localEvent.id
          ? {
              ...event,
              synced: true,
              sync_status: 'synced',
              synced_at: now(),
            }
          : event,
      )

      writeLocalAuditEvents(updatedEvents)

      return {
        local: localEvent,
        backend: true,
      }
    } catch (error) {
      console.warn('[Audit] Envoi backend impossible, audit conservé localement:', {
        action: localEvent.action,
        entity: localEvent.entity,
        entityId: localEvent.entityId,
        message: error.response?.data?.message || error.response?.data?.error || error.message,
      })

      return {
        local: localEvent,
        backend: false,
      }
    }
  },

  listLocalEvents() {
    return readLocalAuditEvents()
  },

  clearLocalEvents() {
    writeLocalAuditEvents([])

    return {
      message: 'Audit local vidé.',
    }
  },

  markAsSynced(id) {
    const events = readLocalAuditEvents()

    const updatedEvents = events.map((event) =>
      event.id === id
        ? {
            ...event,
            synced: true,
            sync_status: 'synced',
            synced_at: now(),
          }
        : event,
    )

    writeLocalAuditEvents(updatedEvents)
  },
}
