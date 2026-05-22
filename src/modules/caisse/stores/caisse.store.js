import { defineStore } from 'pinia'
import { caisseService } from '@/modules/caisse/services/caisse.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'
import { patientFullName } from '@/shared/utils/patient'

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }

  return fallback
}

function normalizeStatus(value) {
  const status = String(value || '').toLowerCase()

  const map = {
    pending: 'pending',
    attente: 'pending',
    en_attente: 'pending',

    paid: 'paid',
    paye: 'paid',
    payé: 'paid',
    valide: 'paid',
    validé: 'paid',

    cancelled: 'cancelled',
    canceled: 'cancelled',
    annule: 'cancelled',
    annulé: 'cancelled',
  }

  return map[status] || 'pending'
}

function normalizePaiement(item) {
  if (!item) return null

  const raw = item

  const patient =
    raw.patient ||
    raw.identification_patient ||
    raw.identificationPatient ||
    raw.reception?.identification_patient ||
    raw.consultation?.identification_patient ||
    {}

  const status = normalizeStatus(
    pick(raw, ['statut', 'status', 'etat', 'état'], raw.paye || raw.paid ? 'paid' : 'pending'),
  )

  return {
    raw,

    id: pick(raw, ['id', '_id', 'identifiant', 'paiement_id', 'paiementId']),
    reception_id: pick(raw, ['reception_id', 'receptionId'], pick(raw.reception, ['id'])),
    consultation_id: pick(
      raw,
      ['consultation_id', 'consultationId'],
      pick(raw.consultation, ['id']),
    ),
    facture_id: pick(raw, ['facture_id', 'factureId'], pick(raw.facture, ['id'])),

    numero_patient: pick(
      patient,
      ['numero_patient', 'numeroPatient'],
      pick(raw, ['numero_patient', 'numeroPatient'], '—'),
    ),

    numero_fiche: pick(
      raw,
      ['numero_fiche', 'numeroFiche'],
      pick(raw.reception, ['numero_fiche'], pick(raw.consultation, ['numero_fiche'], '—')),
    ),

    nom: pick(patient, ['nom'], pick(raw, ['nom'])),
    postnom: pick(patient, ['postnom'], pick(raw, ['postnom'])),
    prenom: pick(patient, ['prenom', 'prénom'], pick(raw, ['prenom', 'prénom'])),

    service: pick(raw, ['service', 'module', 'source'], 'Caisse'),
    motif: pick(raw, ['motif', 'description', 'libelle', 'libellé'], ''),
    reference: pick(raw, ['reference', 'référence', 'ref', 'numero_recu', 'numeroRecu'], ''),

    montant: Number(pick(raw, ['montant', 'amount', 'total'], 0)) || 0,
    devise: pick(raw, ['devise', 'currency'], 'CDF'),
    mode_paiement: pick(raw, ['mode_paiement', 'modePaiement', 'payment_method'], 'CASH'),

    statut: status,
    paye: status === 'paid',

    date_paiement: pick(raw, ['date_paiement', 'datePaiement', 'paid_at', 'paidAt'], ''),
    created_at: pick(raw, ['created_at', 'createdAt', 'date_creation'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.paiements ||
    payload?.payments ||
    payload?.caisse ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizePaiement).filter(Boolean) : []

  const pagination = payload?.pagination || payload?.meta || {}

  const page = Number(payload?.page || pagination.page || pagination.currentPage || 1)

  const limite = Number(
    payload?.limit ||
      payload?.limite ||
      pagination.limit ||
      pagination.limite ||
      pagination.perPage ||
      10,
  )

  const total = Number(
    payload?.total ||
      payload?.count ||
      pagination.total ||
      pagination.totalItems ||
      items.length ||
      0,
  )

  const totalPages = Number(
    payload?.pages ||
      payload?.totalPages ||
      pagination.pages ||
      pagination.totalPages ||
      Math.ceil(total / limite) ||
      1,
  )

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
  const paiement =
    payload?.paiement ||
    payload?.payment ||
    payload?.caisse ||
    payload?.data ||
    payload?.données ||
    payload?.result ||
    payload

  return normalizePaiement(paiement)
}

function buildValidatePayload() {
  return {
    statut: 'paid',
    status: 'paid',
    paye: true,
    paid: true,
    date_paiement: new Date().toISOString().split('T')[0],
  }
}

function buildCancelPayload() {
  return {
    statut: 'cancelled',
    status: 'cancelled',
  }
}

export const useCaisseStore = defineStore('caisse', {
  state: () => ({
    paiements: [],
    selectedPaiement: null,

    loading: false,
    saving: false,
    deleting: false,
    validating: false,
    cancelling: false,
    searching: false,

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
    },
  }),

  actions: {
    async fetchPaiements(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await caisseService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.paiements = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Impossible de charger les paiements.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async searchPaiements(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
        service: filters.service ?? '',
      }

      try {
        await this.fetchPaiements({ page: 1 })

        const q = String(this.filters.q || '')
          .toLowerCase()
          .trim()

        this.paiements = this.paiements.filter((item) => {
          const fullName = [item.nom, item.postnom, item.prenom]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          const matchesQ =
            !q ||
            fullName.includes(q) ||
            String(item.numero_patient || '')
              .toLowerCase()
              .includes(q) ||
            String(item.numero_fiche || '')
              .toLowerCase()
              .includes(q) ||
            String(item.reference || '')
              .toLowerCase()
              .includes(q) ||
            String(item.motif || '')
              .toLowerCase()
              .includes(q) ||
            String(item.montant || '')
              .toLowerCase()
              .includes(q)

          const matchesStatut = !this.filters.statut || item.statut === this.filters.statut
          const matchesService = !this.filters.service || item.service === this.filters.service

          return matchesQ && matchesStatut && matchesService
        })

        this.pagination = {
          page: 1,
          limite: this.paiements.length || 10,
          total: this.paiements.length,
          hasNext: false,
          hasPrev: false,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche paiement impossible.'

        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchPaiementById(id) {
      this.loading = true
      this.error = ''
      this.selectedPaiement = null

      try {
        const payload = await caisseService.getById(id)
        this.selectedPaiement = normalizeSingleResponse(payload)

        return this.selectedPaiement
      } catch (error) {
        this.error =
          error.response?.data?.message || error.response?.data?.error || 'Paiement introuvable.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async createPaiement(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await caisseService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Paiement créé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CAISSE,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'CASH_PAYMENT_CREATED',
            message: 'Paiement caisse créé',
            montant: created?.montant,
            devise: created?.devise,
          },
        })

        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création du paiement impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePaiement(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await caisseService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedPaiement = updated
        }

        toast.success('Paiement mis à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CAISSE,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'CASH_PAYMENT_UPDATED',
            message: 'Paiement caisse mis à jour',
            montant: updated?.montant,
            devise: updated?.devise,
          },
        })
        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour du paiement impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async validatePaiement(paiement) {
      const toast = useToastStore()

      this.validating = true
      this.error = ''

      try {
        const payload = buildValidatePayload()
        const response = await caisseService.update(paiement.id, payload)
        const updated = normalizeSingleResponse(response)

        this.paiements = this.paiements.map((item) =>
          String(item.id) === String(paiement.id)
            ? updated || { ...item, statut: 'paid', paye: true }
            : item,
        )

        toast.success('Paiement validé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CAISSE,
          id: paiement.id,
          status: HIS_STATUSES.CASH_VALIDATED,
          details: {
            numero_fiche: updated?.numero_fiche || paiement.numero_fiche,
            numero_patient: updated?.numero_patient || paiement.numero_patient,
            patient: patientFullName(updated || paiement),
            action: 'CASH_VALIDATED',
            message: 'Paiement caisse validé',
            montant: updated?.montant || paiement.montant,
            devise: updated?.devise || paiement.devise,
          },
        })

        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Validation du paiement impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.validating = false
      }
    },

    async cancelPaiement(paiement) {
      const toast = useToastStore()

      this.cancelling = true
      this.error = ''

      try {
        const payload = buildCancelPayload()
        const response = await caisseService.update(paiement.id, payload)
        const updated = normalizeSingleResponse(response)

        this.paiements = this.paiements.map((item) =>
          String(item.id) === String(paiement.id)
            ? updated || { ...item, statut: 'cancelled' }
            : item,
        )

        toast.success('Paiement annulé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CAISSE,
          id: paiement.id,
          status: HIS_STATUSES.CASH_CANCELLED,
          details: {
            numero_fiche: updated?.numero_fiche || paiement.numero_fiche,
            numero_patient: updated?.numero_patient || paiement.numero_patient,
            patient: patientFullName(updated || paiement),
            action: 'CASH_CANCELLED',
            message: 'Paiement caisse annulé',
            montant: updated?.montant || paiement.montant,
            devise: updated?.devise || paiement.devise,
          },
        })

        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Annulation du paiement impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.cancelling = false
      }
    },

    async removePaiement(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await caisseService.remove(id)

        this.paiements = this.paiements.filter((item) => String(item.id) !== String(id))

        toast.success('Paiement supprimé avec succès.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CAISSE,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'CASH_PAYMENT_DELETED',
            message: 'Paiement caisse supprimé',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression du paiement impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})
