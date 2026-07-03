import api from "@/shared/services/api"

function unwrapResponse(response) {
  return response?.data ?? response
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  )
}

export const hospitalisationService = {
  async list(params = {}) {
    const response = await api.get("/hospitalisations", {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 10,
        q: params.q,
        status: params.status,
        serviceId: params.serviceId,
      }),
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/hospitalisations/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post("/hospitalisations", payload)
    return unwrapResponse(response)
  },

  async update(id, payload) {
    const response = await api.patch(`/hospitalisations/${id}`, payload)
    return unwrapResponse(response)
  },

  async discharge(id, payload = {}) {
    const response = await api.patch(`/hospitalisations/${id}/discharge`, payload)
    return unwrapResponse(response)
  },
}
