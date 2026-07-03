import api from "@/shared/services/api"

function unwrapResponse(response) {
  return response?.data ?? response
}

export const dmeDashboardService = {
  async getDashboard() {
    const response = await api.get("/dme/dashboard")
    return unwrapResponse(response)
  },
}
