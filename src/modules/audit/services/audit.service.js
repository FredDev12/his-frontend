import api from '@/shared/services/api'

const RESOURCE = '/audit'

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

export const auditService = {
  async list(params = {}) {
    const response = await api.get(RESOURCE, {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 20,
      }),
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`${RESOURCE}/${id}`)
    return unwrapResponse(response)
  },
}
