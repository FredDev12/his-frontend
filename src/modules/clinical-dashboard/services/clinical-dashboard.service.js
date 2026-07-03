import api from "@/shared/services/api"

function unwrapResponse(response) {
  return response?.data ?? response
}

export const clinicalDashboardService = {
  async getDashboard() {
    const response = await api.get("/clinical-dashboard")
    return unwrapResponse(response)
  },

  async getAlerts() {
    const response = await api.get("/clinical-dashboard/alerts")
    return unwrapResponse(response)
  },

  async getActivePatients() {
    const response = await api.get("/clinical-dashboard/active-patients")
    return unwrapResponse(response)
  },

  async getOccupancy() {
    const response = await api.get("/clinical-dashboard/occupancy")
    return unwrapResponse(response)
  },

  async getRecentActivity() {
    const response = await api.get("/clinical-dashboard/recent-activity")
    return unwrapResponse(response)
  },

  async getPatientFlow() {
    const response = await api.get("/clinical-dashboard/patient-flow")
    return unwrapResponse(response)
  },

  async getLiveKpis() {
    const response = await api.get("/clinical-dashboard/live-kpis")
    return unwrapResponse(response)
  },

  async getLiveFeed() {
    const response = await api.get("/clinical-dashboard/live-feed")
    return unwrapResponse(response)
  },

  async getServiceStatus() {
    const response = await api.get("/clinical-dashboard/service-status")
    return unwrapResponse(response)
  },

  async getIntelligentAlerts() {
    const response = await api.get("/clinical-dashboard/intelligent-alerts")
    return unwrapResponse(response)
  },
}









