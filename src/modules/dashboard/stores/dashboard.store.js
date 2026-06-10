import { defineStore } from 'pinia'
import { dashboardService } from '@/modules/dashboard/services/dashboard.service'

function revenueTotal(revenueToday = []) {
  return revenueToday.reduce((sum, item) => {
    const value = Number(item.total || 0)
    return sum + (Number.isNaN(value) ? 0 : value)
  }, 0)
}

function revenueCurrency(revenueToday = []) {
  return revenueToday[0]?.currency || 'CDF'
}

function patientName(patient) {
  if (!patient) return 'Patient non identifié'

  return [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.patientCode
}

function mapRecentReceptions(recentReceptions = []) {
  return recentReceptions.map((item) => ({
    id: `reception-${item.id}`,
    module: 'Réception',
    title: `Réception ${item.receptionCode}`,
    description: patientName(item.patient),
    date: item.createdAt,
    to: `/receptions/${item.id}`,
    status: item.status,
    priority: item.priority,
  }))
}

function mapCriticalEpisodes(criticalEpisodes = []) {
  return criticalEpisodes.map((item) => ({
    id: `episode-${item.id}`,
    type: item.priority === 'VITALE' ? 'danger' : 'warning',
    title: `${item.priority} — ${item.episodeCode}`,
    message: `${patientName(item.patient)} · ${item.service?.name || 'Service non précisé'} · ${item.status}`,
    date: item.createdAt,
    to: `/receptions/${item.id}`,
  }))
}

function mapQueueAlerts(queues = []) {
  return queues
    .filter((queue) => Number(queue.count || 0) > 0)
    .map((queue) => ({
      id: `queue-${queue.status}`,
      type: queue.status === 'EN_PHARMACIE' ? 'warning' : 'info',
      title: queue.label,
      message: `${queue.count} patient(s)`,
      status: queue.status,
      count: queue.count,
    }))
}

function mapDashboard(raw) {
  const cards = raw?.cards || {}
  const queues = raw?.queues || []
  const revenueToday = raw?.revenueToday || []
  const recentReceptions = raw?.recentReceptions || []
  const criticalEpisodes = raw?.criticalEpisodes || []

  const queueAlerts = mapQueueAlerts(queues)
  const criticalAlerts = mapCriticalEpisodes(criticalEpisodes)

  return {
    raw,
    generated_at: new Date().toISOString(),

    period: raw?.period || null,

    kpis: {
      patients: cards.patientsCreatedToday || 0,
      receptionsToday: cards.receptionsToday || 0,
      triageToday: cards.inTriage || 0,
      consultationsToday: cards.inConsultation || 0,
      paiementsToday: cards.paiementsToday || 0,
      sortiesToday: cards.sortiesToday || 0,
      urgentTriage: criticalEpisodes.length || 0,
      unreadNotifications: criticalAlerts.length,
      totalPaiementsToday: revenueTotal(revenueToday),
      totalPaiements: revenueTotal(revenueToday),
      devise: revenueCurrency(revenueToday),

      episodesOpen: cards.episodesOpen || 0,
      waitingPayment: cards.waitingPayment || 0,
      inTriage: cards.inTriage || 0,
      inConsultation: cards.inConsultation || 0,
      inExamen: cards.inExamen || 0,
      inPharmacie: cards.inPharmacie || 0,
      readyToExit: cards.readyToExit || 0,
      facturesToday: cards.facturesToday || 0,
    },

    queues,
    revenueToday,
    recentReceptions,
    criticalEpisodes,

    alerts: [...criticalAlerts, ...queueAlerts],
    latestNotifications: criticalAlerts,
    recentActivity: mapRecentReceptions(recentReceptions),

    technical: {
      hasPartialErrors: false,
      errors: {},
    },
  }
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    error: '',
    dashboard: null,
  }),

  actions: {
    async fetchDashboard(filters = {}) {
      this.loading = true
      this.error = ''

      try {
        const rawDashboard = await dashboardService.fetchDashboard(filters)
        this.dashboard = mapDashboard(rawDashboard)
        return this.dashboard
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Impossible de charger le dashboard.'

        throw error
      } finally {
        this.loading = false
      }
    },

    clearDashboard() {
      this.dashboard = null
      this.error = ''
    },
  },
})