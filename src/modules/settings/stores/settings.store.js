import { defineStore } from 'pinia'
import { settingsService } from '@/modules/settings/services/settings.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'

function normalizeSettings(payload) {
  const data = payload?.data || payload || {}

  return {
    general: data.general || {},
    workflow: data.workflow || {},
    payment_modes: Array.isArray(data.payment_modes) ? data.payment_modes : [],
    laboratory_exam_types: Array.isArray(data.laboratory_exam_types)
      ? data.laboratory_exam_types
      : [],
    imaging_exam_types: Array.isArray(data.imaging_exam_types) ? data.imaging_exam_types : [],
    discharge_types: Array.isArray(data.discharge_types) ? data.discharge_types : [],
    updated_at: data.updated_at || '',
  }
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null,
    loading: false,
    saving: false,
    resetting: false,
    error: '',
  }),

  actions: {
    async fetchSettings() {
      this.loading = true
      this.error = ''

      try {
        const payload = await settingsService.get()
        this.settings = normalizeSettings(payload)

        return this.settings
      } catch (error) {
        this.error = error.message || 'Impossible de charger les paramètres système.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateSettings(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await settingsService.update(payload)
        this.settings = normalizeSettings(response)

        toast.success('Paramètres système enregistrés avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SETTINGS,
          id: 'system-settings',
          status: HIS_STATUSES.SETTINGS_UPDATED,
          details: {
            action: 'SETTINGS_UPDATED',
            message: 'Paramètres système enregistrés',
          },
        })

        return this.settings
      } catch (error) {
        const message = error.message || 'Enregistrement des paramètres impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async resetSettings() {
      const toast = useToastStore()

      this.resetting = true
      this.error = ''

      try {
        const response = await settingsService.reset()
        this.settings = normalizeSettings(response)

        toast.success('Paramètres système réinitialisés.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SETTINGS,
          id: 'system-settings',
          status: HIS_STATUSES.SETTINGS_RESET,
          details: {
            action: 'SETTINGS_RESET',
            message: 'Paramètres système réinitialisés',
          },
        })
        return this.settings
      } catch (error) {
        const message = error.message || 'Réinitialisation impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.resetting = false
      }
    },
  },
})
