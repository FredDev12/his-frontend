import api from '@/shared/services/api'

function getTodayLocalDate() {
  return new Date().toISOString().slice(0, 10)
}

function getTimezoneOffsetMinutes() {
  /**
   * Backend Phase 15 attend un offset positif pour UTC+2 = 120.
   * getTimezoneOffset() retourne -120 pour Lubumbashi, donc on inverse.
   */
  return -new Date().getTimezoneOffset()
}

export const dashboardService = {
  async fetchDashboard(filters = {}) {
    const response = await api.get('/dashboard', {
      params: {
        date: filters.date || getTodayLocalDate(),
        timezoneOffsetMinutes:
          filters.timezoneOffsetMinutes ?? getTimezoneOffsetMinutes(),
      },
    })

    return response.data?.data?.item || response.data?.item || response.data
  },
}