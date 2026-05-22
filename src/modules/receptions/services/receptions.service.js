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

export const receptionsService = {
  async list(params = {}) {
    const limit = params.limit || params.limite || 10

    const response = await api.get('/receptions', {
      params: cleanParams({
        page: params.page || 1,

        // On envoie les deux pour être compatible avec le backend existant.
        limit,
        limite: limit,
      }),
    })

    console.log(response)

    return unwrapResponse(response)
  },

  async recent(limit = 10) {
    const response = await api.get('/receptions/recentes', {
      params: {
        limit,
        limite: limit,
      },
    })

    return unwrapResponse(response)
  },

  async urgent() {
    const response = await api.get('/receptions/urgentes')
    return unwrapResponse(response)
  },

  async search(params = {}) {
    const response = await api.get('/receptions/search', {
      params: cleanParams({
        q: params.q,
        urgence: params.urgence,
        service: params.service,
        paye: params.paye,
      }),
    })

    return unwrapResponse(response)
  },

  async getByPatientNumber(numeroPatient) {
    const response = await api.get(`/receptions/patient/${numeroPatient}`)
    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/receptions/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post('/receptions', payload)
    return unwrapResponse(response)
  },

  async update(id, payload) {
    const response = await api.put(`/receptions/${id}`, payload)
    return unwrapResponse(response)
  },

  async validatePayment(id, payload) {
    const response = await api.post(`/receptions/${id}/payment`, payload)
    return unwrapResponse(response)
  },

  async updateStatus(id, payload) {
    const response = await api.post(`/receptions/${id}/status`, payload)
    return unwrapResponse(response)
  },

  async remove(id) {
    const response = await api.delete(`/receptions/${id}`)
    return unwrapResponse(response)
  },
}
