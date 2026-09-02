import api from '@/shared/services/api'

function unwrapResponse(response) {
  return response?.data ?? response
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
}

export const triageService = {
  async getDashboard(params = {}) {
    const response = await api.get('/triages/dashboard', {
      params: cleanParams({
        timezoneOffsetMinutes:
          params.timezoneOffsetMinutes,
      }),
    })

    return unwrapResponse(response)
  },

  async getQueue(params = {}) {
    const response = await api.get('/triages/queue', {
      params: cleanParams({
        q: params.q,
        page: params.page || 1,
        limit: params.limit || 20,
      }),
    })

    return unwrapResponse(response)
  },

  async getQueueItem(episodeId) {
    const response = await api.get(`/triages/queue/${episodeId}`)
    return unwrapResponse(response)
  },

  async getAvailableServices() {
    const response = await api.get('/triages/reference/services')
    return unwrapResponse(response)
  },

  async list(params = {}) {
    const response = await api.get('/triages', {
      params: cleanParams({
        q: params.q,
        episodeId: params.episodeId,
        patientId: params.patientId,
        priority: params.priority,
        status: params.status,
        page: params.page || 1,
        limit: params.limit || 10,
      }),
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/triages/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post('/triages', payload)
    return unwrapResponse(response)
  },

  async getReevaluations(triageId) {
    const response = await api.get(
      `/triages/${triageId}/reevaluations`,
    )

    return unwrapResponse(response)
  },

  async createReevaluation(triageId, payload) {
    const response = await api.post(
      `/triages/${triageId}/reevaluations`,
      payload,
    )

    return unwrapResponse(response)
  },
}
