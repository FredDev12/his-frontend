import { defineStore } from 'pinia'

import { receptionsService } from '@/modules/receptions/services/receptions.service'
import { useToastStore } from '@/shared/stores/toast.store'

const DEFAULT_LIMIT = 10

const EMPTY_FILTERS = Object.freeze({
  q: '',
  payment: '',
  status: '',
  patientType: '',
})

function createEmptyFilters() {
  return { ...EMPTY_FILTERS }
}

function cleanFilterValue(value) {
  return typeof value === 'string' ? value.trim() : value
}

function normalizeFilters(filters = {}) {
  return {
    q: cleanFilterValue(filters.q ?? ''),
    payment: cleanFilterValue(filters.payment ?? ''),
    status: cleanFilterValue(filters.status ?? ''),
    patientType: cleanFilterValue(filters.patientType ?? ''),
  }
}

function normalizeReception(reception) {
  if (!reception) return null

  const patient = reception.patient || {}
  const episode = reception.episode || {}
  const requestedService = reception.requestedService || null

  return {
    ...reception,

    id: reception.id,

    numero_patient: patient.patientCode || '—',
    numero_fiche: reception.receptionCode || '—',
    numero_episode: episode.episodeCode || '—',

    nom: patient.lastName || '',
    postnom: patient.middleName || '',
    prenom: patient.firstName || '',

    patientCode: patient.patientCode || '—',
    receptionCode: reception.receptionCode || '—',
    episodeCode: episode.episodeCode || '—',

    patientType: reception.patientType || '—',
    agentReference: reception.agentReference || '',
    relationToAgent: reception.relationToAgent || '',

    service: requestedService?.name || reception.orientation?.targetModule || 'TRIAGE',
    serviceCode: requestedService?.code || reception.orientation?.targetModule || 'TRIAGE',

    adresse: patient.address || '—',
    telephone: patient.phone || '',
    sexe: patient.gender || '',
    date_naissance: patient.birthDate || '',
    age: patient.estimatedAge ?? '',
    emergencyContactName: patient.emergencyContactName || '',
    emergencyContactPhone: patient.emergencyContactPhone || '',

    fichePayment: reception.fichePayment || null,
    workflow: reception.workflow || null,

    paymentDisplayStatus:
      reception.fichePayment?.status ||
      (!reception.paymentRequired
        ? 'NOT_REQUIRED'
        : reception.paymentValidated
          ? 'PAID'
          : 'PENDING'),

    paymentRequired: Boolean(reception.paymentRequired),
    paymentValidated:
      reception.fichePayment?.validated ?? Boolean(reception.paymentValidated),
    paiement_effectue: reception.fichePayment
      ? reception.fichePayment.status === 'PAID'
      : Boolean(reception.paymentValidated),

    montant:
      reception.fichePayment?.paiement?.amount ||
      reception.fichePayment?.facture?.amount ||
      null,
    devise:
      reception.fichePayment?.paiement?.currency ||
      reception.fichePayment?.facture?.currency ||
      null,
    mode_paiement: reception.fichePayment?.paiement?.mode || '',
    factureNumero: reception.fichePayment?.facture?.factureNumber || '',
    paiementNumero: reception.fichePayment?.paiement?.paiementNumber || '',
    recuNumero: reception.fichePayment?.paiement?.receiptNumber || '',

    paiementLabel:
      reception.fichePayment?.status === 'INCONSISTENT'
        ? 'À vérifier'
        : reception.fichePayment?.status === 'PENDING'
          ? 'À payer'
          : reception.fichePayment?.status === 'PAID'
            ? 'Payé'
            : !reception.paymentRequired
              ? 'Non requis'
              : reception.paymentValidated
                ? 'Payé'
                : 'À payer',

    status: reception.status || '',
    statut: reception.status || '',

    created_at: reception.createdAt || '',
    updated_at: reception.updatedAt || '',

    raw: reception,
  }
}

function normalizeListResponse(payload) {
  const root = payload?.data ?? payload ?? {}
  const nested = root?.data ?? root

  const rawItems =
    nested?.items ??
    nested?.receptions ??
    nested?.rows ??
    nested?.results ??
    (Array.isArray(nested) ? nested : null) ??
    root?.items ??
    root?.receptions ??
    root?.rows ??
    root?.results ??
    []

  const items = Array.isArray(rawItems)
    ? rawItems.map(normalizeReception).filter(Boolean)
    : []

  const meta =
    nested?.pagination ??
    nested?.meta ??
    root?.pagination ??
    root?.meta ??
    {}

  const page = Math.max(
    1,
    Number(
      meta.page ??
      meta.currentPage ??
      nested?.page ??
      nested?.currentPage ??
      root?.page ??
      root?.currentPage ??
      1
    ),
  )

  const limite = Math.max(
    1,
    Number(
      meta.limit ??
      meta.limite ??
      meta.perPage ??
      nested?.limit ??
      nested?.limite ??
      nested?.perPage ??
      root?.limit ??
      root?.limite ??
      root?.perPage ??
      DEFAULT_LIMIT
    ),
  )

  const total = Math.max(
    0,
    Number(
      meta.total ??
      meta.count ??
      meta.totalItems ??
      nested?.total ??
      nested?.count ??
      nested?.totalItems ??
      root?.total ??
      root?.count ??
      root?.totalItems ??
      items.length
    ),
  )

  const totalPages = Math.max(
    1,
    Number(
      meta.totalPages ??
      meta.lastPage ??
      nested?.totalPages ??
      nested?.lastPage ??
      root?.totalPages ??
      root?.lastPage ??
      Math.ceil(total / limite)
    ),
  )

  return {
    items,
    total,
    page,
    limite,
    totalPages,
    hasNext:
      Boolean(meta.hasNext ?? nested?.hasNext ?? root?.hasNext) ||
      page < totalPages,
    hasPrev:
      Boolean(meta.hasPrev ?? nested?.hasPrev ?? root?.hasPrev) ||
      page > 1,
  }
}

function normalizeSingleResponse(payload) {
  const reception = payload?.data?.item || payload?.item || payload?.data || payload
  return normalizeReception(reception)
}

function errorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}

export const useReceptionsStore = defineStore('receptions', {
  state: () => ({
    receptions: [],

    dashboard: {
      generatedAt: null,
      period: null,
      kpis: {
        admissionsToday: 0,
        urgencesToday: 0,
        paymentsPending: 0,
        orientedToTriageToday: 0,
      },
      recentItems: [],
    },

    dashboardLoading: false,
    selectedReception: null,

    patientHistory: [],
    patientHistoryLoading: false,
    patientHistoryError: '',
    patientHistoryTotal: 0,
    patientHistoryLimit: 5,

    loading: false,
    saving: false,
    deleting: false,
    searching: false,
    paying: false,

    error: '',

    pagination: {
      page: 1,
      limite: DEFAULT_LIMIT,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },

    filters: createEmptyFilters(),
  }),

  getters: {
    hasReceptions: (state) => state.receptions.length > 0,

    hasActiveFilters: (state) =>
      Object.values(state.filters).some((value) => String(value || '').trim().length > 0),

    receptionKpis: (state) => ({
      total: state.dashboard.kpis.admissionsToday,
      admissionsToday: state.dashboard.kpis.admissionsToday,
      urgences: state.dashboard.kpis.urgencesToday,
      paiementsEnAttente: state.dashboard.kpis.paymentsPending,
      orientesTriage: state.dashboard.kpis.orientedToTriageToday,
      nonOrientes: Math.max(
        0,
        state.dashboard.kpis.admissionsToday -
          state.dashboard.kpis.orientedToTriageToday,
      ),
    }),
  },

  actions: {
    clearPatientHistory() {
      this.patientHistory = []
      this.patientHistoryError = ''
      this.patientHistoryTotal = 0
      this.patientHistoryLimit = 5
    },

    async fetchPatientHistory(patientId, options = {}) {
      if (!patientId) {
        this.clearPatientHistory()
        return {
          items: [],
          total: 0,
        }
      }

      this.patientHistoryLoading = true
      this.patientHistoryError = ''

      const limit = Math.min(
        100,
        Math.max(1, Number(options.limit ?? this.patientHistoryLimit ?? 5)),
      )

      try {
        const payload = await receptionsService.list({
          patientId: String(patientId),
          page: 1,
          limit,
        })

        const normalized = normalizeListResponse(payload)

        this.patientHistory = normalized.items
        this.patientHistoryTotal = normalized.total
        this.patientHistoryLimit = limit

        return normalized
      } catch (error) {
        this.patientHistoryError = errorMessage(
          error,
          "Impossible de charger l’historique administratif des passages.",
        )
        throw error
      } finally {
        this.patientHistoryLoading = false
      }
    },

    setFilters(filters = {}) {
      this.filters = normalizeFilters(filters)
    },

    resetFilters() {
      this.filters = createEmptyFilters()
    },

    applyListResult(normalized) {
      this.receptions = normalized.items
      this.pagination = {
        page: normalized.page,
        limite: normalized.limite,
        total: normalized.total,
        totalPages: normalized.totalPages,
        hasNext: normalized.hasNext,
        hasPrev: normalized.hasPrev,
      }
    },

    async fetchDashboard() {
      this.dashboardLoading = true
      this.error = ''

      try {
        const payload = await receptionsService.dashboard()
        const data = payload?.data || payload || {}
        const kpis = data.kpis || {}

        this.dashboard = {
          generatedAt: data.generatedAt || null,
          period: data.period || null,
          kpis: {
            admissionsToday: Number(kpis.admissionsToday || 0),
            urgencesToday: Number(kpis.urgencesToday || 0),
            paymentsPending: Number(kpis.paymentsPending || 0),
            orientedToTriageToday: Number(kpis.orientedToTriageToday || 0),
          },
          recentItems: Array.isArray(data.recentItems)
            ? data.recentItems.map(normalizeReception).filter(Boolean)
            : [],
        }

        return this.dashboard
      } catch (error) {
        this.error = errorMessage(
          error,
          'Impossible de charger le dashboard Réception.',
        )
        throw error
      } finally {
        this.dashboardLoading = false
      }
    },

    async fetchReceptions(params = {}) {
      this.loading = true
      this.error = ''

      const page = Math.max(1, Number(params.page ?? this.pagination.page))
      const limite = Math.max(
        1,
        Number(params.limite ?? params.limit ?? this.pagination.limite),
      )

      try {
        const payload = await receptionsService.list({
          page,
          limite,
          ...this.filters,
        })

        const normalized = normalizeListResponse(payload)
        this.applyListResult(normalized)

        return normalized
      } catch (error) {
        this.error = errorMessage(error, 'Impossible de charger les réceptions.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchReceptions(filters = {}) {
      this.searching = true
      this.error = ''
      this.setFilters(filters)

      try {
        return await this.fetchReceptions({
          page: 1,
          limite: this.pagination.limite,
        })
      } finally {
        this.searching = false
      }
    },

    async changePage(page) {
      return this.fetchReceptions({
        page,
        limite: this.pagination.limite,
      })
    },

    async changeLimit(limite) {
      return this.fetchReceptions({
        page: 1,
        limite,
      })
    },

    async refreshCurrentPage() {
      const targetPage =
        this.receptions.length <= 1 && this.pagination.page > 1
          ? this.pagination.page - 1
          : this.pagination.page

      return this.fetchReceptions({
        page: targetPage,
        limite: this.pagination.limite,
      })
    },

    async resetSearch() {
      this.resetFilters()

      return this.fetchReceptions({
        page: 1,
        limite: this.pagination.limite,
      })
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
        this.error = errorMessage(error, 'Réception introuvable.')
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
        return created
      } catch (error) {
        const message = errorMessage(error, 'Création de la réception impossible.')
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async validatePayment(reception, payload) {
      const toast = useToastStore()
      this.paying = true
      this.error = ''

      try {
        const paiement = await receptionsService.validatePayment(reception, payload)

        await this.refreshCurrentPage()
        toast.success('Paiement de la fiche enregistré avec succès.')

        return paiement
      } catch (error) {
        const message = errorMessage(error, 'Validation du paiement impossible.')
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.paying = false
      }
    },

    async removeReception(id, reason) {
      const toast = useToastStore()
      this.deleting = true
      this.error = ''

      try {
        await receptionsService.remove(id, reason)
        await this.refreshCurrentPage()

        toast.success('Réception annulée avec succès.')
      } catch (error) {
        const message = errorMessage(error, 'Annulation de la réception impossible.')
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})

