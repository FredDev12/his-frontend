import { defineStore } from "pinia"
import { dmeDashboardService } from "@/modules/dme/services/dme-dashboard.service"

export const useDmeDashboardStore = defineStore("dmeDashboard", {
  state: () => ({
    stats: {
      patientsToday: 0,
      openRecords: 0,
      activeHospitalisations: 0,
      readyForDischarge: 0,
    },
    recentConsultations: [],
    recentExamens: [],
    recentPrescriptions: [],
    recentHospitalisations: [],
    recentPayments: [],
    recentAudit: [],
    loading: false,
    error: "",
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      this.error = ""

      try {
        const payload = await dmeDashboardService.getDashboard()
        const data = payload?.data || payload

        this.stats = data.stats || this.stats
        this.recentConsultations = data.recentConsultations || []
        this.recentExamens = data.recentExamens || []
        this.recentPrescriptions = data.recentPrescriptions || []
        this.recentHospitalisations = data.recentHospitalisations || []
        this.recentPayments = data.recentPayments || []
        this.recentAudit = data.recentAudit || []

        return data
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Dashboard DME indisponible."
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
