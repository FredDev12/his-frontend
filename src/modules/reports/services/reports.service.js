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
}

function unwrapResponse(response) {
  return response?.data ?? response
}

async function fetchResource(name, endpoint, params = {}) {
  const response = await api.get(endpoint, {
    params: {
      page: 1,
      limit: params.limit || 500,
      limite: params.limit || 500,
    },
  })

  return {
    name,
    payload: unwrapResponse(response),
  }
}

export const reportsService = {
  async fetchAll(params = {}) {
    const entries = Object.entries(ENDPOINTS)

    const results = await Promise.allSettled(
      entries.map(([name, endpoint]) => fetchResource(name, endpoint, params)),
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

    return {
      data,
      errors,
    }
  },
}
