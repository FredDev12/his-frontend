import api from '@/shared/services/api'

const RESOURCE = '/caisse'

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

export const caisseService = {
  async list(params = {}) {
    const limit = params.limit || params.limite || 10

    const response = await api.get(RESOURCE, {
      params: cleanParams({
        page: params.page || 1,
        limit,
        limite: limit,
      }),
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`${RESOURCE}/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post(RESOURCE, payload)
    return unwrapResponse(response)
  },

  async update(id, payload) {
    const response = await api.patch(`${RESOURCE}/${id}`, payload)
    return unwrapResponse(response)
  },

  async remove(id) {
    const response = await api.delete(`${RESOURCE}/${id}`)
    return unwrapResponse(response)
  },
}
