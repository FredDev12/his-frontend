import api from '@/shared/services/api'

const ENDPOINTS = {
  patients: '/patients',
  receptions: '/receptions',
  triage: '/triage',
  consultations: '/consultations',
  laboratoire: '/laboratoire',
  imagerie: '/imagerie',
  pharmacie: '/pharmacie',
  paiements: '/paiements',
  sorties: '/sorties',
  audit: '/audit',
}

const NOTIFICATIONS_STORAGE_KEY = 'his_notifications'

function unwrapResponse(response) {
  return response?.data ?? response
}

async function fetchResource(name, endpoint, limit = 100) {
  const response = await api.get(endpoint, {
    params: {
      page: 1,
      limit,
      limite: limit,
    },
  })

  return {
    name,
    payload: unwrapResponse(response),
  }
}

function readNotifications() {
  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)

  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const dashboardService = {
  async fetchDashboard() {
    const entries = Object.entries(ENDPOINTS)

    const results = await Promise.allSettled(
      entries.map(([name, endpoint]) => fetchResource(name, endpoint)),
    )

    const data = {}
    const errors = {}

    results.forEach((result, index) => {
      const [name] = entries[index]

      if (result.status === 'fulfilled') {
        data[name] = result.value.payload
      } else {
        errors[name] =
          result.reason?.response?.data?.message ||
          result.reason?.response?.data?.error ||
          result.reason?.message ||
          'Chargement impossible.'
      }
    })

    data.notifications = readNotifications()

    return {
      data,
      errors,
    }
  },
}
