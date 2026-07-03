import { defineStore } from 'pinia'
import { receptionsService } from '@/modules/receptions/services/receptions.service'
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

function normalizeReception(reception) {
  if (!reception) return null

  const raw = reception
  const identification =
    raw.identification_patient || raw.identificationPatient || raw.patient || {}
  const paiement = raw.paiement_fiche || raw.paiementFiche || raw.paiement || {}

  const id = pick(raw, ['id', 'identifiant', 'reception_id', 'admission_id'])
  const numeroPatient = pick(
    identification,
    ['numero_patient', 'numéro_patient', 'numeroPatient'],
    pick(raw, ['numero_patient', 'numeroPatient']),
  )
  const numeroFiche = pick(
    raw,
    ['numero_fiche', 'numéro_fiche', 'numeroFiche', 'reference'],
    pick(paiement, ['facture_numero', 'numero_facture']),
  )

  return {
    raw,

    id,
    numero_patient: numeroPatient || '—',
    numero_fiche: numeroFiche || '—',

    nom: pick(identification, ['nom'], pick(raw, ['nom'])),
    postnom: pick(identification, ['postnom'], pick(raw, ['postnom'])),
    prenom: pick(identification, ['prenom', 'prénom'], pick(raw, ['prenom', 'prénom'])),

    sexe: pick(identification, ['sexe'], pick(raw, ['sexe'], '—')),
    date_naissance: pick(
      identification,
      ['date_naissance', 'date de naissance', 'dateNaissance'],
      pick(raw, ['date_naissance', 'dateNaissance']),
    ),
    age: pick(identification, ['age', 'âge'], pick(raw, ['age', 'âge'], '')),
    telephone: pick(
      identification,
      ['telephone', 'téléphone'],
      pick(raw, ['telephone', 'téléphone'], ''),
    ),
    adresse: pick(identification, ['adresse'], pick(raw, ['adresse'], '')),

    service: pick(
      raw,
      ['service', 'service_entree', 'serviceEntree', 'service_demande'],
      'Non orienté',
    ),
    motif: pick(raw, ['motif', 'motif_consultation', 'motifConsultation'], ''),
    urgence: Boolean(pick(raw, ['urgence', 'urgent', 'is_urgent', 'isUrgent'], false)),

    paiement_effectue: Boolean(
      pick(
        paiement,
        ['paiement_effectue', 'paiementEffectue', 'paye', 'paid'],
        pick(raw, ['paiement_effectue', 'paye', 'paid'], false),
      ),
    ),

    montant: Number(pick(paiement, ['montant_fiche', 'montant'], pick(raw, ['montant'], 0))) || 0,
    mode_paiement: pick(
      paiement,
      ['mode_paiement', 'modePaiement'],
      pick(raw, ['mode_paiement', 'modePaiement'], ''),
    ),

    statut: pick(raw, ['statut', 'status'], 'active'),

    created_at: pick(raw, ['created_at', 'createdAt', 'date_creation', 'dateCreation'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.receptions ||
    payload?.réceptions ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    payload?.résultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeReception).filter(Boolean) : []

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
  const reception =
    payload?.reception ||
    payload?.réception ||
    payload?.admission ||
    payload?.data ||
    payload?.données ||
    payload?.result ||
    payload

  return normalizeReception(reception)
}

export const useReceptionsStore = defineStore('receptions', {
  state: () => ({
    receptions: [],
    selectedReception: null,

    loading: false,
    saving: false,
    deleting: false,
    searching: false,
    paying: false,

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
      urgence: '',
      service: '',
      paye: '',
    },
  }),

  getters: {
    hasReceptions: (state) => state.receptions.length > 0,

    receptionKpis: (state) => {
      const items = state.receptions || []

      return {
        total: state.pagination.total || items.length,
        admissionsToday: items.length,
        urgences: items.filter((item) => item.urgence).length,
        paiementsEnAttente: items.filter((item) => !item.paiement_effectue).length,
        orientesTriage: items.filter((item) =>
          String(item.service || '').toLowerCase().includes('triage')
        ).length,
        nonOrientes: items.filter((item) =>
          ['non orienté', '', '—'].includes(String(item.service || '').toLowerCase())
        ).length,
      }
    },
  },

  actions: {
    async fetchReceptions(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await receptionsService.list({
          page: params.page || this.pagination.page,
          limite: params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.receptions = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.response?.data?.message || 'Impossible de charger les réceptions.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchReceptions(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        urgence: filters.urgence ?? '',
        service: filters.service ?? '',
        paye: filters.paye ?? '',
      }

      const hasFilter =
        String(this.filters.q || '').trim().length > 0 ||
        this.filters.urgence !== '' ||
        String(this.filters.service || '').trim().length > 0 ||
        this.filters.paye !== ''

      if (!hasFilter) {
        this.searching = false
        return this.fetchReceptions({ page: 1 })
      }

      try {
        const payload = await receptionsService.search({
          q: String(this.filters.q || '').trim(),
          urgence: this.filters.urgence,
          service: this.filters.service,
          paye: this.filters.paye,
        })

        const normalized = normalizeListResponse(payload)

        this.receptions = normalized.items
        this.pagination = {
          page: 1,
          limite: normalized.limite,
          total: normalized.total || normalized.items.length,
          hasNext: false,
          hasPrev: false,
        }

        return normalized
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche réception impossible.'

        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchReceptionById(id) {
      this.loading = true
      this.error = ''
      this.selectedReception = null

      try {
        const payload = await receptionsService.getById(id)
        this.selectedReception = normalizeSingleResponse(payload)

        return this.selectedReception
      } catch (error) {
        this.error = error.response?.data?.message || 'Réception introuvable.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createReception(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await receptionsService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Réception créée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RECEPTIONS,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'RECEPTION_CREATED',
            message: 'Réception créée',
          },
        })

        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création de la réception impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateReception(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await receptionsService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedReception = updated
        }

        toast.success('Réception mise à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RECEPTIONS,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'RECEPTION_UPDATED',
            message: 'Réception mise à jour',
          },
        })

        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour de la réception impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async validatePayment(id, payload) {
      const toast = useToastStore()

      this.paying = true
      this.error = ''

      try {
        const response = await receptionsService.validatePayment(id, payload)
        const updated = normalizeSingleResponse(response)

        toast.success('Paiement validé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RECEPTIONS,
          id,
          status: HIS_STATUSES.PAYMENT_VALIDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'RECEPTION_PAYMENT_VALIDATED',
            message: 'Paiement réception validé',
            montant: payload?.montant,
            mode_paiement: payload?.mode_paiement,
            reference: payload?.reference,
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
        this.paying = false
      }
    },

    async removeReception(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await receptionsService.remove(id)

        this.receptions = this.receptions.filter((item) => String(item.id) !== String(id))

        toast.success('Réception supprimée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.RECEPTIONS,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'RECEPTION_DELETED',
            message: 'Réception supprimée',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression de la réception impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})



