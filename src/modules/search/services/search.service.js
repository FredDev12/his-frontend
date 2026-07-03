import api from "@/shared/services/api"

function unwrapResponse(response) {
  return response?.data ?? response
}

export const searchService = {
  async globalSearch(params = {}) {
    const response = await api.get("/search", {
      params: {
        q: params.q,
        limit: params.limit || 5,
      },
    })

    return unwrapResponse(response)
  },
}
