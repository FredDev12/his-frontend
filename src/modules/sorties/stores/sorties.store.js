import { defineStore } from 'pinia'
import { sortiesService } from '@/modules/sorties/services/sorties.service'
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
    brouillon: 'pending',
    attente: 'pending',
    en_attente: 'pending',

    validated: 'validated',
    valide: 'validated',
    validé: 'validated',
    discharged: 'validated',
    sortie: 'validated',
    sorti: 'validated',

    cancelled: 'cancelled',
    canceled: 'cancelled',
    annule: 'cancelled',
    annulé: 'cancelled',
  }

  return map[status] || 'pending'
}

function normalizeSortie(item) {
  if (!item) return null

  const raw = item

  const patient =
    raw.patient ||
    raw.identification_patient ||
    raw.identificationPatient ||
    raw.reception?.identification_patient ||
    raw.consultation?.identification_patient ||
    {}

  const status = normalizeStatus(pick(raw, ['statut', 'status', 'etat', 'état'], 'pending'))

  return {
    raw,

    id: pick(raw, ['id', '_id', 'identifiant', 'sortie_id', 'sortieId']),
    reception_id: pick(raw, ['reception_id', 'receptionId'], pick(raw.reception, ['id'])),
    consultation_id: pick(
      raw,
      ['consultation_id', 'consultationId'],
      pick(raw.consultation, ['id']),
    ),

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

    type_sortie: pick(raw, ['type_sortie', 'typeSortie', 'type'], 'SIMPLE'),
    motif_sortie: pick(raw, ['motif_sortie', 'motifSortie', 'motif'], ''),
    destination: pick(raw, ['destination', 'orientation'], ''),
    resume_medical: pick(raw, ['resume_medical', 'résumé_médical', 'resumeMedical', 'resume'], ''),
    consignes: pick(raw, ['consignes', 'instructions', 'recommandations'], ''),

    date_sortie: pick(raw, ['date_sortie', 'dateSortie', 'discharged_at', 'dischargedAt'], ''),
    statut: status,

    created_at: pick(raw, ['created_at', 'createdAt', 'date_creation'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.sorties ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeSortie).filter(Boolean) : []

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
  const sortie = payload?.sortie || payload?.data || payload?.données || payload?.result || payload

  return normalizeSortie(sortie)
}

function buildValidatePayload() {
  return {
    statut: 'validated',
    status: 'validated',
    date_sortie: new Date().toISOString().split('T')[0],
  }
}

function buildCancelPayload() {
  return {
    statut: 'cancelled',
    status: 'cancelled',
  }
}

export const useSortiesStore = defineStore('sorties', {
  state: () => ({
    sorties: [],
    selectedSortie: null,

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
      type_sortie: '',
    },
  }),

  actions: {
    async fetchSorties(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await sortiesService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.sorties = normalized.items
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
          'Impossible de charger les sorties patient.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async searchSorties(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
        type_sortie: filters.type_sortie ?? '',
      }

      try {
        await this.fetchSorties({ page: 1 })

        const q = String(this.filters.q || '')
          .toLowerCase()
          .trim()

        this.sorties = this.sorties.filter((item) => {
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
            String(item.motif_sortie || '')
              .toLowerCase()
              .includes(q) ||
            String(item.destination || '')
              .toLowerCase()
              .includes(q)

          const matchesStatut = !this.filters.statut || item.statut === this.filters.statut
          const matchesType =
            !this.filters.type_sortie || item.type_sortie === this.filters.type_sortie

          return matchesQ && matchesStatut && matchesType
        })

        this.pagination = {
          page: 1,
          limite: this.sorties.length || 10,
          total: this.sorties.length,
          hasNext: false,
          hasPrev: false,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche sortie impossible.'

        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchSortieById(id) {
      this.loading = true
      this.error = ''
      this.selectedSortie = null

      try {
        const payload = await sortiesService.getById(id)
        this.selectedSortie = normalizeSingleResponse(payload)

        return this.selectedSortie
      } catch (error) {
        this.error =
          error.response?.data?.message || error.response?.data?.error || 'Sortie introuvable.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async createSortie(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await sortiesService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Sortie patient créée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SORTIE,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'EXIT_CREATED',
            message: 'Sortie patient créée',
          },
        })
        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création de la sortie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateSortie(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await sortiesService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedSortie = updated
        }

        toast.success('Sortie patient mise à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SORTIE,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'EXIT_UPDATED',
            message: 'Sortie patient mise à jour',
          },
        })
        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour de la sortie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async validateSortie(sortie) {
      const toast = useToastStore()

      this.validating = true
      this.error = ''

      try {
        const payload = buildValidatePayload()
        const response = await sortiesService.update(sortie.id, payload)
        const updated = normalizeSingleResponse(response)

        this.sorties = this.sorties.map((item) =>
          String(item.id) === String(sortie.id)
            ? updated || { ...item, statut: 'validated', date_sortie: payload.date_sortie }
            : item,
        )

        toast.success('Sortie patient validée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SORTIE,
          id: sortie.id,
          status: HIS_STATUSES.EXIT_VALIDATED,
          details: {
            numero_fiche: updated?.numero_fiche || sortie.numero_fiche,
            numero_patient: updated?.numero_patient || sortie.numero_patient,
            patient: patientFullName(updated || sortie),
            action: 'EXIT_VALIDATED',
            message: 'Sortie patient validée',
          },
        })
        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Validation de la sortie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.validating = false
      }
    },

    async cancelSortie(sortie) {
      const toast = useToastStore()

      this.cancelling = true
      this.error = ''

      try {
        const payload = buildCancelPayload()
        const response = await sortiesService.update(sortie.id, payload)
        const updated = normalizeSingleResponse(response)

        this.sorties = this.sorties.map((item) =>
          String(item.id) === String(sortie.id)
            ? updated || { ...item, statut: 'cancelled' }
            : item,
        )

        toast.success('Sortie patient annulée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SORTIE,
          id: sortie.id,
          status: HIS_STATUSES.EXIT_CANCELLED,
          details: {
            numero_fiche: updated?.numero_fiche || sortie.numero_fiche,
            numero_patient: updated?.numero_patient || sortie.numero_patient,
            patient: patientFullName(updated || sortie),
            action: 'EXIT_CANCELLED',
            message: 'Sortie patient annulée',
          },
        })
        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Annulation de la sortie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.cancelling = false
      }
    },

    async removeSortie(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await sortiesService.remove(id)

        this.sorties = this.sorties.filter((item) => String(item.id) !== String(id))

        toast.success('Sortie patient supprimée avec succès.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SORTIE,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'EXIT_DELETED',
            message: 'Sortie patient supprimée',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression de la sortie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})
