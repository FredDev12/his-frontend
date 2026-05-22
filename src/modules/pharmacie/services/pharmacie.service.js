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

export const pharmacieService = {
  async list(params = {}) {
    const limit = params.limit || params.limite || 10

    const response = await api.get('/pharmacie', {
      params: cleanParams({
        page: params.page || 1,
        limit,
        limite: limit,
      }),
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/pharmacie/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post('/pharmacie', payload)
    return unwrapResponse(response)
  },

  async update(id, payload) {
    const response = await api.patch(`/pharmacie/${id}`, payload)
    return unwrapResponse(response)
  },

  async remove(id) {
    const response = await api.delete(`/pharmacie/${id}`)
    return unwrapResponse(response)
  },
}
