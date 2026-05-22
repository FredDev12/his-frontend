import api from '@/shared/services/api'

function unwrapResponse(response) {
  return response?.data ?? response
}

export const patientsService = {
  async list(params = {}) {
    const response = await api.get('/patients', {
      params: {
        page: params.page || 1,
        limit: params.limit || params.limite || 10,
      },
    })

    return unwrapResponse(response)
  },

  async search(query) {
    const response = await api.get('/patients/search', {
      params: {
        q: query,
      },
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/patients/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post('/patients', payload)
    console.log(response)

    return unwrapResponse(response)
  },

  async update(id, payload) {
    const response = await api.patch(`/patients/${id}`, payload)
    return unwrapResponse(response)
  },

  async deactivate(id) {
    const response = await api.delete(`/patients/${id}`)
    return unwrapResponse(response)
  },
}
