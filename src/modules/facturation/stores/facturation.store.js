import { defineStore } from 'pinia'
import { facturationService } from '@/modules/facturation/services/facturation.service'
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
    draft: 'draft',
    brouillon: 'draft',
    issued: 'issued',
    emise: 'issued',
    émise: 'issued',
    paid: 'paid',
    payee: 'paid',
    payée: 'paid',
    cancelled: 'cancelled',
    canceled: 'cancelled',
    annulee: 'cancelled',
    annulée: 'cancelled',
  }

  return map[status] || 'draft'
}

function normalizeFacture(item) {
  if (!item) return null

  return {
    raw: item,
    id: item.id,
    numero: item.numero || '',
    numero_patient: item.numero_patient || '',
    numero_fiche: item.numero_fiche || '',
    nom: item.nom || '',
    postnom: item.postnom || '',
    prenom: item.prenom || '',
    telephone: item.telephone || '',
    statut: normalizeStatus(item.statut),
    devise: item.devise || 'CDF',
    lignes: Array.isArray(item.lignes) ? item.lignes : [],
    sous_total: Number(item.sous_total || 0),
    remise: Number(item.remise || 0),
    taxe: Number(item.taxe || 0),
    total: Number(item.total || 0),
    notes: item.notes || '',
    created_at: item.created_at || '',
    updated_at: item.updated_at || '',
    issued_at: item.issued_at || '',
    paid_at: item.paid_at || '',
    cancelled_at: item.cancelled_at || '',
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.data || payload?.items || []
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeFacture).filter(Boolean) : []

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
  return normalizeFacture(payload?.data || payload?.facture || payload)
}

export const useFacturationStore = defineStore('facturation', {
  state: () => ({
    factures: [],
    selectedFacture: null,

    loading: false,
    loadingDetails: false,
    saving: false,
    deleting: false,
    searching: false,
    issuing: false,
    paying: false,
    cancelling: false,

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
      date: '',
    },
  }),

  getters: {
    totalFactures: (state) => state.pagination.total || state.factures.length,
    draftCount: (state) => state.factures.filter((item) => item.statut === 'draft').length,
    issuedCount: (state) => state.factures.filter((item) => item.statut === 'issued').length,
    paidCount: (state) => state.factures.filter((item) => item.statut === 'paid').length,
    cancelledCount: (state) => state.factures.filter((item) => item.statut === 'cancelled').length,
    totalAmount: (state) => state.factures.reduce((sum, item) => sum + Number(item.total || 0), 0),

    financialKpis: (state) => {
      const items = state.factures || []

      const amountOf = (filterFn) =>
        items.filter(filterFn).reduce((sum, item) => sum + Number(item.total || 0), 0)

      const isDraft = (item) => item.statut === 'draft'
      const isIssued = (item) => item.statut === 'issued'
      const isPaid = (item) => item.statut === 'paid'
      const isCancelled = (item) => item.statut === 'cancelled'
      const isUnpaid = (item) => ['draft', 'issued'].includes(item.statut)

      return {
        total: state.pagination.total || items.length,
        brouillons: items.filter(isDraft).length,
        emises: items.filter(isIssued).length,
        payees: items.filter(isPaid).length,
        annulees: items.filter(isCancelled).length,
        impayees: items.filter(isUnpaid).length,
        totalAmount: amountOf(() => true),
        paidAmount: amountOf(isPaid),
        unpaidAmount: amountOf(isUnpaid),
        cancelledAmount: amountOf(isCancelled),
        devise: items[0]?.devise || 'CDF',
      }
    },
  },

  actions: {
    async fetchFactures(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await facturationService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.factures = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Impossible de charger les factures.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchFactures(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
        date: filters.date ?? '',
      }

      try {
        const payload = await facturationService.search({
          ...this.filters,
          page: 1,
          limit: this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.factures = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Recherche facture impossible.'
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchFactureById(id) {
      this.loadingDetails = true
      this.error = ''
      this.selectedFacture = null

      try {
        const payload = await facturationService.getById(id)
        this.selectedFacture = normalizeSingleResponse(payload)

        return this.selectedFacture
      } catch (error) {
        this.error = error.message || 'Facture introuvable.'
        throw error
      } finally {
        this.loadingDetails = false
      }
    },

    async createFacture(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await facturationService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Facture créée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.FACTURATION,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'FACTURE_CREATED',
            message: 'Facture créée',
            numero_facture: created?.numero,
            total: created?.total,
            devise: created?.devise,
          },
        })

        return created
      } catch (error) {
        const message = error.message || 'Création facture impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateFacture(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await facturationService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        this.selectedFacture = updated
        toast.success('Facture mise à jour.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.FACTURATION,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'FACTURE_UPDATED',
            message: 'Facture mise à jour',
            numero_facture: updated?.numero,
            total: updated?.total,
            devise: updated?.devise,
          },
        })

        return updated
      } catch (error) {
        const message = error.message || 'Modification facture impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async issueFacture(facture) {
      const toast = useToastStore()

      this.issuing = true

      try {
        const response = await facturationService.issue(facture.id)
        const updated = normalizeSingleResponse(response)

        this.factures = this.factures.map((item) =>
          String(item.id) === String(facture.id) ? updated : item,
        )

        if (this.selectedFacture?.id === facture.id) {
          this.selectedFacture = updated
        }

        toast.success('Facture émise.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.FACTURATION,
          id: facture.id,
          status: HIS_STATUSES.FACTURE_ISSUED,
          details: {
            numero_fiche: updated?.numero_fiche || facture.numero_fiche,
            numero_patient: updated?.numero_patient || facture.numero_patient,
            patient: patientFullName(updated || facture),
            action: 'FACTURE_ISSUED',
            message: 'Facture émise',
            numero_facture: updated?.numero || facture.numero,
            total: updated?.total || facture.total,
            devise: updated?.devise || facture.devise,
          },
        })

        return updated
      } finally {
        this.issuing = false
      }
    },

    async markFacturePaid(facture) {
      const toast = useToastStore()

      this.paying = true

      try {
        const response = await facturationService.markPaid(facture.id)
        const updated = normalizeSingleResponse(response)

        this.factures = this.factures.map((item) =>
          String(item.id) === String(facture.id) ? updated : item,
        )

        if (this.selectedFacture?.id === facture.id) {
          this.selectedFacture = updated
        }

        toast.success('Facture marquée comme payée.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.FACTURATION,
          id: facture.id,
          status: HIS_STATUSES.FACTURE_PAID,
          details: {
            numero_fiche: updated?.numero_fiche || facture.numero_fiche,
            numero_patient: updated?.numero_patient || facture.numero_patient,
            patient: patientFullName(updated || facture),
            action: 'FACTURE_PAID',
            message: 'Facture marquée comme payée',
            numero_facture: updated?.numero || facture.numero,
            total: updated?.total || facture.total,
            devise: updated?.devise || facture.devise,
          },
        })

        return updated
      } finally {
        this.paying = false
      }
    },

    async cancelFacture(facture) {
      const toast = useToastStore()

      this.cancelling = true

      try {
        const response = await facturationService.cancel(facture.id)
        const updated = normalizeSingleResponse(response)

        this.factures = this.factures.map((item) =>
          String(item.id) === String(facture.id) ? updated : item,
        )

        if (this.selectedFacture?.id === facture.id) {
          this.selectedFacture = updated
        }

        toast.success('Facture annulée.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.FACTURATION,
          id: facture.id,
          status: HIS_STATUSES.FACTURE_CANCELLED,
          details: {
            numero_fiche: updated?.numero_fiche || facture.numero_fiche,
            numero_patient: updated?.numero_patient || facture.numero_patient,
            patient: patientFullName(updated || facture),
            action: 'FACTURE_CANCELLED',
            message: 'Facture annulée',
            numero_facture: updated?.numero || facture.numero,
          },
        })

        return updated
      } finally {
        this.cancelling = false
      }
    },

    async removeFacture(id) {
      const toast = useToastStore()

      this.deleting = true

      try {
        await facturationService.remove(id)
        this.factures = this.factures.filter((item) => String(item.id) !== String(id))
        toast.success('Facture supprimée.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.FACTURATION,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'FACTURE_DELETED',
            message: 'Facture supprimée',
          },
        })
      } finally {
        this.deleting = false
      }
    },
  },
})


