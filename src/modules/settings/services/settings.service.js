const STORAGE_KEY = 'his_system_settings'

const DEFAULT_SETTINGS = {
  general: {
    hospital_name: 'Hôpital CAC',
    hospital_code: 'CAC-HIS',
    address: '',
    phone: '',
    email: '',
    default_currency: 'CDF',
    timezone: 'Africa/Kinshasa',
    language: 'fr',
  },

  workflow: {
    require_payment_before_pharmacy: true,
    require_payment_before_exit: true,
    require_audit_for_critical_actions: true,
    enable_emergency_confirmation: true,
  },

  payment_modes: ['CASH', 'MOBILE_MONEY', 'CARD', 'VIREMENT', 'CHEQUE'],

  laboratory_exam_types: [
    'Goutte épaisse',
    'Numération formule sanguine',
    'Glycémie',
    'Test paludisme',
    'Widal',
    'Urines',
  ],

  imaging_exam_types: ['RADIOGRAPHIE', 'ECHOGRAPHIE', 'SCANNER', 'IRM', 'ECG'],

  discharge_types: ['SIMPLE', 'TRANSFERT', 'CONTRE_AVIS', 'EVASION', 'DECES'],

  updated_at: new Date().toISOString(),
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readSettings() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    const defaults = clone(DEFAULT_SETTINGS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  }

  try {
    const parsed = JSON.parse(stored)

    return {
      ...clone(DEFAULT_SETTINGS),
      ...parsed,
      general: {
        ...clone(DEFAULT_SETTINGS.general),
        ...(parsed.general || {}),
      },
      workflow: {
        ...clone(DEFAULT_SETTINGS.workflow),
        ...(parsed.workflow || {}),
      },
      payment_modes: Array.isArray(parsed.payment_modes)
        ? parsed.payment_modes
        : clone(DEFAULT_SETTINGS.payment_modes),
      laboratory_exam_types: Array.isArray(parsed.laboratory_exam_types)
        ? parsed.laboratory_exam_types
        : clone(DEFAULT_SETTINGS.laboratory_exam_types),
      imaging_exam_types: Array.isArray(parsed.imaging_exam_types)
        ? parsed.imaging_exam_types
        : clone(DEFAULT_SETTINGS.imaging_exam_types),
      discharge_types: Array.isArray(parsed.discharge_types)
        ? parsed.discharge_types
        : clone(DEFAULT_SETTINGS.discharge_types),
    }
  } catch {
    const defaults = clone(DEFAULT_SETTINGS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  }
}

function writeSettings(settings) {
  const payload = {
    ...settings,
    updated_at: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))

  return payload
}

export const settingsService = {
  async get() {
    return {
      data: readSettings(),
    }
  },

  async update(payload) {
    return {
      data: writeSettings(payload),
    }
  },

  async reset() {
    const defaults = clone(DEFAULT_SETTINGS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))

    return {
      data: defaults,
    }
  },
}
