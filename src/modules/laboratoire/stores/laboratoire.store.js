import { defineStore } from 'pinia'

import { laboratoireService } from '@/modules/laboratoire/services/laboratoire.service'
import { useToastStore } from '@/shared/stores/toast.store'

const PENDING_STATUSES = new Set(['DEMANDE', 'EN_COURS'])
const VALIDATED_STATUS = 'RESULTAT_DISPONIBLE'

function normalizeLaboratoire(item) {
  if (!item) return null

  const patient = item.patient || {}
  const episode = item.episode || {}
  const consultation = item.consultation || {}

  return {
    raw: item,

    id: String(item.id || ''),
    examen_code: item.examenCode || '—',
    consultation_id: consultation.id || item.consultationId || '',
    consultation_code: consultation.consultationCode || '—',
    episode_id: episode.id || item.episodeId || '',
    episode_code: episode.episodeCode || '—',
    episode_status: episode.status || '',
    patient_id: patient.id || item.patientId || '',
    numero_patient: patient.patientCode || '—',

    nom: patient.lastName || '',
    postnom: '',
    prenom: patient.firstName || '',

    type: item.type || '',
    examen_principal: item.name || '—',
    indication_clinique: item.clinicalIndication || '',
    statut: item.status || '',
    resultat: item.resultText || '',
    conclusion: item.resultConclusion || '',
    resultat_at: item.resultAt || null,

    demande_par: item.requestedByUser || null,
    realise_par: item.performedByUser || null,
    valide_par: item.resultValidatedByUser || null,

    created_at: item.createdAt || '',
    updated_at: item.updatedAt || '',
  }
}

function normalizeListResponse(payload) {
  const data = payload?.data || {}
  const rawItems = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(data?.items)
      ? data.items
      : []

  const items = rawItems
    .map(normalizeLaboratoire)
    .filter(Boolean)

  const page = Number(data?.page || payload?.page || 1)
  const limite = Number(data?.limit || payload?.limit || 10)
  const total = Number(
    payload?.count ??
      payload?.total ??
      data?.count ??
      data?.total ??
      items.length,
  )

  return {
    items,
    total,
    page,
    limite,
    hasNext: page * limite < total,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  return normalizeLaboratoire(
    payload?.data?.item ||
      payload?.item ||
      payload?.data ||
      payload,
  )
}

export const useLaboratoireStore = defineStore('laboratoire', {
  state: () => ({
    examens: [],
    selectedExamen: null,

    loading: false,
    saving: false,
    searching: false,

    error: '',

    pagination: {
      page: 1,
      limite: 10,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    kpis: {
      total: 0,
      demandes: 0,
      enCours: 0,
      resultatsDisponibles: 0,
    },

    filters: {
      q: '',
      statut: '',
    },
  }),

  getters: {
    laboratoireKpis: (state) => ({
      ...state.kpis,
      examensEnAttente:
        state.kpis.demandes +
        state.kpis.enCours,
      examensValides:
        state.kpis.resultatsDisponibles,
    }),
  },

  actions: {
    async fetchExamens(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await laboratoireService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
          q: params.q ?? this.filters.q,
          status: params.statut ?? this.filters.statut,
        })

        const normalized = normalizeListResponse(payload)

        this.examens = normalized.items
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
          error?.message ||
          'Impossible de charger les examens de laboratoire.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchKpis() {
      this.error = ''

      try {
        const kpis =
          await laboratoireService.kpis()

        this.kpis = {
          total: Number(kpis.total || 0),
          demandes: Number(kpis.demandes || 0),
          enCours: Number(kpis.enCours || 0),
          resultatsDisponibles: Number(
            kpis.resultatsDisponibles || 0,
          ),
        }

        return this.kpis
      } catch (error) {
        this.error =
          error?.message ||
          'Impossible de charger les indicateurs du laboratoire.'
        throw error
      }
    },

    async searchExamens(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
      }

      try {
        return await this.fetchExamens({
          page: 1,
          q: this.filters.q,
          statut: this.filters.statut,
        })
      } finally {
        this.searching = false
      }
    },

    async fetchExamenById(id) {
      this.loading = true
      this.error = ''
      this.selectedExamen = null

      try {
        const payload = await laboratoireService.getById(id)
        const normalized =
          normalizeSingleResponse(payload)

        if (
          !normalized ||
          normalized.type !== 'LABORATOIRE'
        ) {
          throw {
            message:
              'Cet examen n’appartient pas au laboratoire.',
            code: 'LABORATOIRE_TYPE_SCOPE_DENIED',
          }
        }

        this.selectedExamen = normalized
        return this.selectedExamen
      } catch (error) {
        this.error =
          error?.message ||
          'Examen de laboratoire introuvable.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async validateResult(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const previousStatus =
          this.selectedExamen?.statut ??
          this.examens.find(
            (item) => String(item.id) === String(id),
          )?.statut ??
          ''

        const response =
          await laboratoireService.updateResult(id, payload)

        const updated =
          normalizeSingleResponse(response)

        this.selectedExamen = updated

        const index = this.examens.findIndex(
          (item) => String(item.id) === String(id),
        )

        if (index >= 0 && updated) {
          this.examens[index] = updated
        }

        if (
          updated?.statut === VALIDATED_STATUS &&
          previousStatus !== VALIDATED_STATUS
        ) {
          if (previousStatus === 'DEMANDE') {
            this.kpis.demandes = Math.max(
              0,
              this.kpis.demandes - 1,
            )
          }

          if (previousStatus === 'EN_COURS') {
            this.kpis.enCours = Math.max(
              0,
              this.kpis.enCours - 1,
            )
          }

          this.kpis.resultatsDisponibles += 1
        }

        toast.success(
          'Résultat de laboratoire validé avec succès.',
        )

        return updated
      } catch (error) {
        this.error =
          error?.message ||
          'Impossible de valider le résultat.'
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})

export {
  normalizeLaboratoire,
  normalizeListResponse,
  normalizeSingleResponse,
  PENDING_STATUSES,
  VALIDATED_STATUS,
}

