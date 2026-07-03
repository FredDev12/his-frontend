import { defineStore } from "pinia"
import { clinicalDashboardService } from "@/modules/clinical-dashboard/services/clinical-dashboard.service"

export const useClinicalDashboardStore = defineStore("clinicalDashboard", {
  state: () => ({
    stats: {
      waitingPatients: 0,
      consultationsToday: 0,
      activeHospitalisations: 0,
      emergencyPatients: 0,
      dischargesToday: 0,
      occupiedBeds: 0,
      freeBeds: 0,
    },
    activeQueue: [],
    activePatients: [],
    alerts: [],
    criticalAlerts: {
      criticalPatients: 0,
      waitingPatients: 0,
      activeHospitalisations: 0,
      pendingDischarges: 0,
      unpaidInvoices: 0,
      urgentLabResults: 0,
      lowDrugStock: 0,
    },
    serviceOccupancy: [],
    recentActivities: [],
    recentActivity: [],
    patientFlow: [],
    intelligentAlerts: {
      alerts: [],
      count: 0,
      criticalCount: 0,
      warningCount: 0,
      generatedAt: "",
    },
    serviceStatus: {
      services: [],
      generatedAt: "",
    },
    liveFeed: {
      items: [],
      generatedAt: "",
    },
    liveKpis: {
      cards: [],
      summary: {},
      generatedAt: "",
    },
    loading: false,
    error: "",
  }),

  actions: {
    async fetchIntelligentAlerts() {
      try {
        const payload = await clinicalDashboardService.getIntelligentAlerts()
        const data = payload?.data || payload
        this.intelligentAlerts = {
          alerts: data?.alerts || [],
          count: data?.count || 0,
          criticalCount: data?.criticalCount || 0,
          warningCount: data?.warningCount || 0,
          generatedAt: data?.generatedAt || "",
        }
        return this.intelligentAlerts
      } catch {
        return this.intelligentAlerts
      }
    },

    async fetchServiceStatus() {
      try {
        const payload = await clinicalDashboardService.getServiceStatus()
        const data = payload?.data || payload
        this.serviceStatus = {
          services: data?.services || [],
          generatedAt: data?.generatedAt || "",
        }
        return this.serviceStatus
      } catch {
        return this.serviceStatus
      }
    },

    async fetchLiveFeed() {
      try {
        const payload = await clinicalDashboardService.getLiveFeed()
        const data = payload?.data || payload
        this.liveFeed = {
          items: data?.items || [],
          generatedAt: data?.generatedAt || "",
        }
        return this.liveFeed
      } catch {
        return this.liveFeed
      }
    },

    async fetchLiveKpis() {
      try {
        const payload = await clinicalDashboardService.getLiveKpis()
        const data = payload?.data || payload
        this.liveKpis = {
          cards: data?.cards || [],
          summary: data?.summary || {},
          generatedAt: data?.generatedAt || "",
        }
        return this.liveKpis
      } catch {
        return this.liveKpis
      }
    },

    async fetchPatientFlow() {
      try {
        const payload = await clinicalDashboardService.getPatientFlow()
        this.patientFlow = payload?.data || payload || []
        return this.patientFlow
      } catch {
        this.patientFlow = []
        return this.patientFlow
      }
    },

    async fetchRecentActivity() {
      try {
        const payload = await clinicalDashboardService.getRecentActivity()
        this.recentActivity = payload?.data || payload || []
        return this.recentActivity
      } catch {
        this.recentActivity = []
        return this.recentActivity
      }
    },

    async fetchOccupancy() {
      try {
        const payload = await clinicalDashboardService.getOccupancy()
        const data = payload?.data || payload
        this.occupancy = {
          services: data?.services || [],
          summary: data?.summary || this.occupancy.summary,
        }
        return this.occupancy
      } catch {
        return this.occupancy
      }
    },

    async fetchActivePatients() {
      try {
        const payload = await clinicalDashboardService.getActivePatients()
        this.activePatients = payload?.data || payload || []
        return this.activePatients
      } catch {
        this.activePatients = []
        return this.activePatients
      }
    },

    async fetchAlerts() {
      try {
        const payload = await clinicalDashboardService.getAlerts()
        const data = payload?.data || payload
        this.criticalAlerts = {
          ...this.criticalAlerts,
          ...data,
        }
        return this.criticalAlerts
      } catch {
        return this.criticalAlerts
      }
    },

    async fetchDashboard() {
      this.loading = true
      this.error = ""

      try {
        const payload = await clinicalDashboardService.getDashboard()
        const data = payload?.data || payload

        this.stats = data.stats || this.stats
        this.activeQueue = data.activeQueue || []
        this.alerts = data.alerts || []
        this.serviceOccupancy = data.serviceOccupancy || []
        this.recentActivities = data.recentActivities || []
        await this.fetchAlerts()
        await this.fetchActivePatients()
        await this.fetchOccupancy()
        await this.fetchRecentActivity()
        await this.fetchPatientFlow()
        await this.fetchLiveKpis()
        await this.fetchLiveFeed()
        await this.fetchServiceStatus()
        await this.fetchIntelligentAlerts()

        return data
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Dashboard clinique indisponible."
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})










