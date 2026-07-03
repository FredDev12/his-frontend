import api from "@/shared/services/api"

function unwrapResponse(response) {
  return response?.data ?? response
}

export const sortiesService = {
  async list(params = {}) {
    const response = await api.get("/sorties", { params })
    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/sorties/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post("/sorties", payload)
    return unwrapResponse(response)
  },

  async update(id, payload) {
    const response = await api.patch(`/sorties/${id}`, payload)
    return unwrapResponse(response)
  },
}
