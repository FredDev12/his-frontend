import { defineStore } from 'pinia'
import { rendezVousService } from '@/modules/rendez-vous/services/rendezvous.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'
import { patientFullName } from '@/shared/utils/patient'

function normalizeStatus(value) {
  const status = String(value || '').toLowerCase()

  const map = {
    scheduled: 'scheduled',
    programme: 'scheduled',
    programmé: 'scheduled',

    confirmed: 'confirmed',
    confirme: 'confirmed',
    confirmé: 'confirmed',

    completed: 'completed',
    termine: 'completed',
    terminé: 'completed',
    honored: 'completed',
    honore: 'completed',
    honoré: 'completed',

    cancelled: 'cancelled',
    canceled: 'cancelled',
    annule: 'cancelled',
    annulé: 'cancelled',
  }

  return map[status] || 'scheduled'
}

function normalizeRendezVous(item) {
  if (!item) return null

  return {
    raw: item,

    id: item.id,
    numero_patient: item.numero_patient || '',
    numero_fiche: item.numero_fiche || '',
    nom: item.nom || '',
    postnom: item.postnom || '',
    prenom: item.prenom || '',
    telephone: item.telephone || '',
    service: item.service || '',
    medecin: item.medecin || '',
    motif: item.motif || '',
    date_rdv: item.date_rdv || '',
    heure_rdv: item.heure_rdv || '',
    statut: normalizeStatus(item.statut),
    notes: item.notes || '',
    created_at: item.created_at || '',
    updated_at: item.updated_at || '',
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.data || payload?.items || []
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeRendezVous).filter(Boolean) : []

  const pagination = payload?.pagination || {}

  const page = Number(pagination.page || 1)
  const limite = Number(pagination.limit || pagination.limite || 10)
  const total = Number(pagination.total || items.length || 0)
  const totalPages = Number(pagination.pages || Math.ceil(total / limite) || 1)

  return {
    items,
    total,
    page,
    limite,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  return normalizeRendezVous(payload?.data || payload?.rendez_vous || payload)
}

export const useRendezVousStore = defineStore('rendezVous', {
  state: () => ({
    rendezVous: [],
    selectedRendezVous: null,

    loading: false,
    saving: false,
    deleting: false,
    searching: false,
    confirming: false,
    cancelling: false,
    completing: false,

    error: '',

    pagination: {
      page: 1,
      limite: 10,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    filters: {
      q: '',
      statut: '',
      service: '',
      date_rdv: '',
    },
  }),

  actions: {
    async fetchRendezVous(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await rendezVousService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.rendezVous = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Impossible de charger les rendez-vous.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchRendezVous(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
        service: filters.service ?? '',
        date_rdv: filters.date_rdv ?? '',
      }

      try {
        const payload = await rendezVousService.search({
          ...this.filters,
          page: 1,
          limit: this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.rendezVous = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Recherche rendez-vous impossible.'
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchRendezVousById(id) {
      this.loading = true
      this.error = ''
      this.selectedRendezVous = null

      try {
        const payload = await rendezVousService.getById(id)
        this.selectedRendezVous = normalizeSingleResponse(payload)

        return this.selectedRendezVous
      } catch (error) {
        this.error = error.message || 'Rendez-vous introuvable.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRendezVous(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await rendezVousService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Rendez-vous créé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RENDEZ_VOUS,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'APPOINTMENT_CREATED',
            message: 'Rendez-vous créé',
          },
        })

        return created
      } catch (error) {
        const message = error.message || 'Création du rendez-vous impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateRendezVous(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await rendezVousService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedRendezVous = updated
        }

        toast.success('Rendez-vous mis à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RENDEZ_VOUS,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'APPOINTMENT_UPDATED',
            message: 'Rendez-vous mis à jour',
          },
        })
        return updated
      } catch (error) {
        const message = error.message || 'Modification du rendez-vous impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async confirmRendezVous(rdv) {
      const toast = useToastStore()

      this.confirming = true

      try {
        const response = await rendezVousService.update(rdv.id, {
          statut: 'confirmed',
        })

        const updated = normalizeSingleResponse(response)

        this.rendezVous = this.rendezVous.map((item) =>
          String(item.id) === String(rdv.id) ? updated : item,
        )

        toast.success('Rendez-vous confirmé.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RENDEZ_VOUS,
          id: rdv.id,
          status: HIS_STATUSES.APPOINTMENT_CONFIRMED,
          details: {
            numero_fiche: updated?.numero_fiche || rdv.numero_fiche,
            numero_patient: updated?.numero_patient || rdv.numero_patient,
            patient: patientFullName(updated || rdv),
            action: 'APPOINTMENT_CONFIRMED',
            message: 'Rendez-vous confirmé',
          },
        })
        return updated
      } finally {
        this.confirming = false
      }
    },

    async completeRendezVous(rdv) {
      const toast = useToastStore()

      this.completing = true

      try {
        const response = await rendezVousService.update(rdv.id, {
          statut: 'completed',
        })

        const updated = normalizeSingleResponse(response)

        this.rendezVous = this.rendezVous.map((item) =>
          String(item.id) === String(rdv.id) ? updated : item,
        )

        toast.success('Rendez-vous marqué comme terminé.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RENDEZ_VOUS,
          id: rdv.id,
          status: HIS_STATUSES.APPOINTMENT_COMPLETED,
          details: {
            numero_fiche: updated?.numero_fiche || rdv.numero_fiche,
            numero_patient: updated?.numero_patient || rdv.numero_patient,
            patient: patientFullName(updated || rdv),
            action: 'APPOINTMENT_COMPLETED',
            message: 'Rendez-vous terminé',
          },
        })

        return updated
      } finally {
        this.completing = false
      }
    },

    async cancelRendezVous(rdv) {
      const toast = useToastStore()

      this.cancelling = true

      try {
        const response = await rendezVousService.update(rdv.id, {
          statut: 'cancelled',
        })

        const updated = normalizeSingleResponse(response)

        this.rendezVous = this.rendezVous.map((item) =>
          String(item.id) === String(rdv.id) ? updated : item,
        )

        toast.success('Rendez-vous annulé.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RENDEZ_VOUS,
          id: rdv.id,
          status: HIS_STATUSES.APPOINTMENT_CANCELLED,
          details: {
            numero_fiche: updated?.numero_fiche || rdv.numero_fiche,
            numero_patient: updated?.numero_patient || rdv.numero_patient,
            patient: patientFullName(updated || rdv),
            action: 'APPOINTMENT_CANCELLED',
            message: 'Rendez-vous annulé',
          },
        })
        return updated
      } finally {
        this.cancelling = false
      }
    },

    async removeRendezVous(id) {
      const toast = useToastStore()

      this.deleting = true

      try {
        await rendezVousService.remove(id)
        this.rendezVous = this.rendezVous.filter((item) => String(item.id) !== String(id))

        toast.success('Rendez-vous supprimé.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RENDEZ_VOUS,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'APPOINTMENT_DELETED',
            message: 'Rendez-vous supprimé',
          },
        })
      } finally {
        this.deleting = false
      }
    },
  },
})
