import { defineStore } from 'pinia'
import { administrationService } from '@/modules/administration/services/administration.service'

function normalizeModule(item) {
  return {
    key: item.key,
    label: item.label,
    endpoint: item.endpoint || '',
    storageKey: item.storageKey || '',
    type: item.type || 'unknown',
    status: item.status || 'unknown',
    total: Number(item.total || 0),
    size: Number(item.size || 0),
    message: item.message || '',
    checked_at: item.checked_at || '',
  }
}

function buildAlerts(apiModules, localModules) {
  const alerts = []

  const apiErrors = apiModules.filter((item) => item.status === 'error')
  const localEmpty = localModules.filter((item) => item.status === 'empty')

  if (apiErrors.length > 0) {
    alerts.push({
      id: 'api-errors',
      tone: 'danger',
      title: 'Modules API indisponibles',
      message: `${apiErrors.length} module(s) API ne répondent pas correctement.`,
      count: apiErrors.length,
    })
  }

  if (localEmpty.length > 0) {
    alerts.push({
      id: 'local-empty',
      tone: 'warning',
      title: 'Référentiels locaux non initialisés',
      message: `${localEmpty.length} référentiel(s) localStorage ne sont pas encore initialisés.`,
      count: localEmpty.length,
    })
  }

  const notificationModule = localModules.find((item) => item.key === 'notifications')
  if (notificationModule && notificationModule.total > 0) {
    alerts.push({
      id: 'notifications',
      tone: 'primary',
      title: 'Notifications présentes',
      message: `${notificationModule.total} notification(s) enregistrée(s) localement.`,
      count: notificationModule.total,
    })
  }

  const stockModule = localModules.find((item) => item.key === 'stock-pharmacie')
  if (stockModule && stockModule.total > 0) {
    alerts.push({
      id: 'stock',
      tone: 'success',
      title: 'Stock pharmacie initialisé',
      message: `${stockModule.total} produit(s) dans le référentiel stock.`,
      count: stockModule.total,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'stable',
      tone: 'success',
      title: 'Système stable',
      message: 'Aucune alerte administrative détectée.',
      count: 0,
    })
  }

  return alerts
}

export const useAdministrationStore = defineStore('administration', {
  state: () => ({
    apiModules: [],
    localModules: [],
    alerts: [],

    loading: false,
    error: '',
    generated_at: '',
  }),

  getters: {
    totalApiModules: (state) => state.apiModules.length,
    onlineApiModules: (state) => state.apiModules.filter((item) => item.status === 'online').length,
    apiErrorModules: (state) => state.apiModules.filter((item) => item.status === 'error').length,

    totalLocalModules: (state) => state.localModules.length,
    availableLocalModules: (state) =>
      state.localModules.filter((item) => item.status === 'available').length,

    totalRecords: (state) =>
      [...state.apiModules, ...state.localModules].reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      ),

    hasErrors: (state) => state.apiModules.some((item) => item.status === 'error'),
  },

  actions: {
    async fetchAdministration() {
      this.loading = true
      this.error = ''

      try {
        const response = await administrationService.fetchAdministration()
        const data = response?.data || {}

        this.apiModules = Array.isArray(data.apiModules) ? data.apiModules.map(normalizeModule) : []

        this.localModules = Array.isArray(data.localModules)
          ? data.localModules.map(normalizeModule)
          : []

        this.alerts = buildAlerts(this.apiModules, this.localModules)
        this.generated_at = data.generated_at || new Date().toISOString()

        return {
          apiModules: this.apiModules,
          localModules: this.localModules,
          alerts: this.alerts,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Impossible de charger la console administration.'

        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
