import api from '@/shared/services/api'

const API_MODULES = [
  {
    key: 'health',
    label: 'health',
    endpoint: '/health',
    type: 'API',
  },
  {
    key: 'patients',
    label: 'Patients',
    endpoint: '/patients',
    type: 'API',
  },
  {
    key: 'receptions',
    label: 'Réceptions',
    endpoint: '/receptions',
    type: 'API',
  },
  {
    key: 'triage',
    label: 'Triage / Urgences',
    endpoint: '/triage',
    type: 'API',
  },
  {
    key: 'consultations',
    label: 'Consultations',
    endpoint: '/consultations',
    type: 'API',
  },
  {
    key: 'laboratoire',
    label: 'Laboratoire',
    endpoint: '/laboratoire',
    type: 'API',
  },
  {
    key: 'imagerie',
    label: 'Imagerie',
    endpoint: '/imagerie',
    type: 'API',
  },
  {
    key: 'pharmacie',
    label: 'Pharmacie',
    endpoint: '/pharmacie',
    type: 'API',
  },
  {
    key: 'paiements',
    label: 'Caisse / Paiements',
    endpoint: '/paiements',
    type: 'API',
  },
  {
    key: 'sorties',
    label: 'Sorties patient',
    endpoint: '/sorties',
    type: 'API',
  },
  {
    key: 'audit',
    label: 'Audit',
    endpoint: '/audit',
    type: 'API',
  },
  {
    key: 'users',
    label: 'Utilisateurs système',
    endpoint: '/auth/admin/users',
    type: 'API',
  },
]

const LOCAL_MODULES = [
  {
    key: 'services',
    label: 'Services hospitaliers',
    storageKey: 'his_hospital_services',
    type: 'localStorage',
  },
  {
    key: 'settings',
    label: 'Paramètres système',
    storageKey: 'his_system_settings',
    type: 'localStorage',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    storageKey: 'his_notifications',
    type: 'localStorage',
  },
  {
    key: 'rendez-vous',
    label: 'Rendez-vous',
    storageKey: 'his_rendez_vous',
    type: 'localStorage',
  },
  {
    key: 'stock-pharmacie',
    label: 'Stock pharmacie',
    storageKey: 'his_pharmacy_stock_products',
    type: 'localStorage',
  },
  {
    key: 'stock-mouvements',
    label: 'Mouvements stock',
    storageKey: 'his_pharmacy_stock_movements',
    type: 'localStorage',
  },
  {
    key: 'facturation',
    label: 'Facturation',
    storageKey: 'his_factures',
    type: 'localStorage',
  },
  {
    key: 'audit-local',
    label: 'Audit local',
    storageKey: 'his_audit_events',
    type: 'localStorage',
  },
]

function unwrapResponse(response) {
  return response?.data ?? response
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload

  const keys = [
    'data',
    'items',
    'results',
    'patients',
    'receptions',
    'triage',
    'triages',
    'consultations',
    'laboratoire',
    'imagerie',
    'pharmacie',
    'paiements',
    'sorties',
    'audits',
    'logs',
    'users',
    'utilisateurs',
  ]

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  return []
}

function extractTotal(payload, items = []) {
  return Number(
    payload?.pagination?.total ||
      payload?.meta?.total ||
      payload?.total ||
      payload?.count ||
      items.length ||
      0,
  )
}

async function checkApiModule(module) {
  try {
    const response = await api.get(module.endpoint, {
      params: {
        page: 1,
        limit: 1,
        limite: 1,
      },
    })

    const payload = unwrapResponse(response)
    const items = extractItems(payload)

    return {
      ...module,
      status: 'online',
      total: extractTotal(payload, items),
      message: 'Disponible',
      checked_at: new Date().toISOString(),
    }
  } catch (error) {
    return {
      ...module,
      status: 'error',
      total: 0,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Indisponible',
      checked_at: new Date().toISOString(),
    }
  }
}

function readStorageValue(storageKey) {
  const stored = localStorage.getItem(storageKey)

  if (!stored) {
    return {
      exists: false,
      count: 0,
      size: 0,
      value: null,
    }
  }

  try {
    const parsed = JSON.parse(stored)

    return {
      exists: true,
      count: Array.isArray(parsed) ? parsed.length : 1,
      size: new Blob([stored]).size,
      value: parsed,
    }
  } catch {
    return {
      exists: true,
      count: 1,
      size: new Blob([stored]).size,
      value: stored,
    }
  }
}

function checkLocalModule(module) {
  const result = readStorageValue(module.storageKey)

  return {
    ...module,
    status: result.exists ? 'available' : 'empty',
    total: result.count,
    size: result.size,
    message: result.exists ? 'Disponible localement' : 'Non initialisé',
    checked_at: new Date().toISOString(),
  }
}

export const administrationService = {
  async fetchAdministration() {
    const apiResults = await Promise.all(API_MODULES.map(checkApiModule))
    const localResults = LOCAL_MODULES.map(checkLocalModule)

    return {
      data: {
        apiModules: apiResults,
        localModules: localResults,
        generated_at: new Date().toISOString(),
      },
    }
  },
}
