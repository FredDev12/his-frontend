import api from '@/shared/services/api'
import { auditClientService } from '@/shared/services/audit-client.service'

const LOCAL_STATUS_EVENTS_KEY = 'his_status_events'

export const HIS_STATUS_MODULES = {
  PATIENTS: 'patients',
  RECEPTIONS: 'receptions',
  TRIAGE: 'triage',
  CONSULTATIONS: 'consultations',
  LABORATOIRE: 'laboratoire',
  IMAGERIE: 'imagerie',
  PHARMACIE: 'pharmacie',
  CAISSE: 'caisse',
  SORTIE: 'sortie',

  // Modules pré-API / localStorage / sans route status backend actuelle
  RENDEZ_VOUS: 'rendez-vous',
  STOCK_PHARMACIE: 'stock-pharmacie',
  FACTURATION: 'facturation',
  SERVICES: 'services',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  USERS: 'users',
  ADMINISTRATION: 'administration',
}

export const HIS_STATUSES = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',

  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',

  PAYMENT_VALIDATED: 'PAYMENT_VALIDATED',

  TRIAGE_URGENT: 'TRIAGE_URGENT',

  CONSULTATION_CREATED: 'CONSULTATION_CREATED',
  CONSULTATION_UPDATED: 'CONSULTATION_UPDATED',

  LAB_RESULT_AVAILABLE: 'LAB_RESULT_AVAILABLE',
  IMAGING_RESULT_AVAILABLE: 'IMAGING_RESULT_AVAILABLE',

  PHARMACY_DELIVERED: 'PHARMACY_DELIVERED',

  CASH_VALIDATED: 'CASH_VALIDATED',
  CASH_CANCELLED: 'CASH_CANCELLED',

  EXIT_VALIDATED: 'EXIT_VALIDATED',
  EXIT_CANCELLED: 'EXIT_CANCELLED',

  APPOINTMENT_CONFIRMED: 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',

  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  STOCK_ADJUSTED: 'STOCK_ADJUSTED',

  FACTURE_ISSUED: 'FACTURE_ISSUED',
  FACTURE_PAID: 'FACTURE_PAID',
  FACTURE_CANCELLED: 'FACTURE_CANCELLED',

  SERVICE_ACTIVATED: 'SERVICE_ACTIVATED',
  SERVICE_DEACTIVATED: 'SERVICE_DEACTIVATED',

  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  SETTINGS_RESET: 'SETTINGS_RESET',

  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
  USER_DELETED: 'USER_DELETED',
}

const MODULE_STATUS_ENDPOINTS = {
  patients: '/patients',
  receptions: '/receptions',
  triage: '/triage',
  consultations: '/consultations',
  laboratoire: '/laboratoire',
  imagerie: '/imagerie',
  pharmacie: '/pharmacie',
  caisse: '/caisse',

  // La documentation API utilise /api/sortie/:id/status.
  sortie: '/sortie',
}

const LOCAL_STATUS_MODULES = [
  'rendez-vous',
  'stock-pharmacie',
  'facturation',
  'services',
  'settings',
  'notifications',
  'users',
  'administration',
]

function assertValidPayload({ module, id, status }) {
  if (!module) {
    throw new Error('Module requis pour diffuser un statut.')
  }

  if (!MODULE_STATUS_ENDPOINTS[module] && !LOCAL_STATUS_MODULES.includes(module)) {
    throw new Error(`Module status non supporté : ${module}`)
  }

  if (!id) {
    throw new Error('ID entité requis pour diffuser un statut.')
  }

  if (!status) {
    throw new Error('Champ status requis pour diffuser un statut.')
  }
}

function normalizeDetails(details = {}) {
  return {
    numero_fiche: details.numero_fiche || details.numeroFiche || '',
    numero_patient: details.numero_patient || details.numeroPatient || '',
    patient: details.patient || '',
    module: details.module || '',
    action: details.action || '',
    message: details.message || '',
    source: details.source || 'his-web',
    timestamp: details.timestamp || new Date().toISOString(),
    ...details,
  }
}

function readLocalStatusEvents() {
  const stored = localStorage.getItem(LOCAL_STATUS_EVENTS_KEY)

  if (!stored) {
    localStorage.setItem(LOCAL_STATUS_EVENTS_KEY, JSON.stringify([]))
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.setItem(LOCAL_STATUS_EVENTS_KEY, JSON.stringify([]))
    return []
  }
}

function writeLocalStatusEvents(items) {
  localStorage.setItem(LOCAL_STATUS_EVENTS_KEY, JSON.stringify(items))
}

function buildAuditFromStatus({ module, id, status, details = {}, backendResult = null }) {
  return {
    action: details.action || status || 'STATUS_BROADCAST',
    entity: module,
    entityId: id,

    numero_fiche: details.numero_fiche || '',
    numero_patient: details.numero_patient || '',
    patient: details.patient || '',

    oldValue: details.oldValue || details.old_value || null,
    newValue: {
      status,
      details,
      backendResult,
    },

    details: {
      ...details,
      status,
      module,
      broadcast: Boolean(backendResult),
    },

    auditLevel:
      status === 'DELETED' ||
      status === 'CASH_CANCELLED' ||
      status === 'FACTURE_CANCELLED' ||
      status === 'EXIT_CANCELLED'
        ? 'WARNING'
        : 'INFO',
  }
}

function createLocalStatusEvent({ module, id, status, details = {} }) {
  const items = readLocalStatusEvents()

  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    module,
    entity_id: id,
    status,
    details: normalizeDetails({
      ...details,
      module,
    }),
    synced: false,
    sync_status: 'pending',
    created_at: new Date().toISOString(),
  }

  items.unshift(event)
  writeLocalStatusEvents(items.slice(0, 500))

  auditClientService.auditLocal(
    buildAuditFromStatus({
      module,
      id,
      status,
      details: event.details,
      backendResult: null,
    }),
  )

  return {
    message: 'Statut local enregistré.',
    data: event,
  }
}

export const statusBroadcastService = {
  async broadcast({ module, id, status, details = {} }) {
    assertValidPayload({ module, id, status })

    const endpoint = MODULE_STATUS_ENDPOINTS[module]

    if (!endpoint) {
      return createLocalStatusEvent({
        module,
        id,
        status,
        details,
      })
    }

    const normalizedDetails = normalizeDetails({
      ...details,
      module,
    })

    const response = await api.post(`${endpoint}/${id}/status`, {
      status,
      details: normalizedDetails,
    })

    await auditClientService.auditSafe(
      buildAuditFromStatus({
        module,
        id,
        status,
        details: normalizedDetails,
        backendResult: response.data,
      }),
    )

    return response.data
  },

  async broadcastSafe(payload) {
    try {
      return await this.broadcast(payload)
    } catch (error) {
      console.warn('[StatusBroadcast] Diffusion statut échouée:', {
        payload,
        message: error.response?.data?.message || error.response?.data?.error || error.message,
      })

      return null
    }
  },

  listLocalEvents() {
    return readLocalStatusEvents()
  },

  clearLocalEvents() {
    writeLocalStatusEvents([])

    return {
      message: 'Événements status locaux vidés.',
    }
  },
}
