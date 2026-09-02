import { defineStore } from 'pinia'

import {
  IMAGING_TYPES,
  imagerieService,
} from '@/modules/imagerie/services/imagerie.service'
import { useToastStore } from '@/shared/stores/toast.store'

const PENDING_STATUSES = new Set([
  'DEMANDE',
  'EN_COURS',
])
const VALIDATED_STATUS = 'RESULTAT_DISPONIBLE'
const IMAGING_TYPE_SET = new Set(IMAGING_TYPES)

function normalizeImagerie(item) {
  if (!item) return null
  if (!IMAGING_TYPE_SET.has(item.type)) return null

  const patient = item.patient || {}
  const episode = item.episode || {}
  const consultation = item.consultation || {}

  return {
    raw: item,

    id: String(item.id || ''),
    examen_code: item.examenCode || '—',

    consultation_id:
      consultation.id ||
      item.consultationId ||
      '',
    consultation_code:
      consultation.consultationCode ||
      '—',

    episode_id:
      episode.id ||
      item.episodeId ||
      '',
    episode_code:
      episode.episodeCode ||
      '—',
    episode_status:
      episode.status ||
      '',

    patient_id:
      patient.id ||
      item.patientId ||
      '',
    numero_patient:
      patient.patientCode ||
      '—',

    nom: patient.lastName || '',
    postnom: '',
    prenom: patient.firstName || '',

    type: item.type || '',
    examen_principal: item.name || '—',
    indication_clinique:
      item.clinicalIndication || '',
    statut: item.status || '',

    resultat: item.resultText || '',
    conclusion:
      item.resultConclusion || '',
    resultat_at:
      item.resultAt || null,

    demande_par:
      item.requestedByUser || null,
    realise_par:
      item.performedByUser || null,
    valide_par:
      item.resultValidatedByUser || null,

    created_at: item.createdAt || '',
    updated_at: item.updatedAt || '',
  }
}

function normalizeListResponse(payload) {
  const data = payload?.data || {}

  const rawItems = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(payload?.items)
      ? payload.items
      : []

  const items = rawItems
    .map(normalizeImagerie)
    .filter(Boolean)

  const page = Number(
    data?.page ||
      payload?.page ||
      1,
  )
  const limite = Number(
    data?.limit ||
      payload?.limit ||
      10,
  )

  /*
   * Pour le rôle IMAGERIE, le backend R4.4G1 filtre déjà
   * strictement le périmètre par type + site.
   *
   * Le filtre local ci-dessus reste une défense UX pour
   * les profils ADMIN, sans remplacer l'autorité backend.
   */
  const rawTotal = Number(
    data?.count ??
      payload?.count ??
      items.length,
  )

  const total =
    rawItems.length === items.length
      ? rawTotal
      : items.length

  return {
    items,
    total,
    page,
    limite,
    hasNext:
      rawItems.length === items.length
        ? page * limite < rawTotal
        : false,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  return normalizeImagerie(
    payload?.data?.item ||
      payload?.item ||
      payload?.data ||
      payload,
  )
}

export const useImagerieStore = defineStore(
  'imagerie',
  {
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

      filters: {
        q: '',
        statut: '',
        type: '',
      },
    }),

    getters: {
      imagerieKpis: (state) => {
        const items = state.examens || []

        return {
          total:
            state.pagination.total ||
            items.length,
          examensEnAttente:
            items.filter((item) =>
              PENDING_STATUSES.has(
                item.statut,
              ),
            ).length,
          comptesRendusDisponibles:
            items.filter(
              (item) =>
                item.statut ===
                VALIDATED_STATUS,
            ).length,
        }
      },
    },

    actions: {
      async fetchExamens(params = {}) {
        this.loading = true
        this.error = ''

        try {
          const payload =
            await imagerieService.list({
              page:
                params.page ||
                this.pagination.page,
              limit:
                params.limit ||
                params.limite ||
                this.pagination.limite,
              q:
                params.q ??
                this.filters.q,
              statut:
                params.statut ??
                this.filters.statut,
              type:
                params.type ??
                this.filters.type,
            })

          const normalized =
            normalizeListResponse(payload)

          this.examens =
            normalized.items
          this.pagination = {
            page: normalized.page,
            limite: normalized.limite,
            total: normalized.total,
            hasNext:
              normalized.hasNext,
            hasPrev:
              normalized.hasPrev,
          }

          return normalized
        } catch (error) {
          this.error =
            error?.message ||
            'Impossible de charger les examens d’imagerie.'
          throw error
        } finally {
          this.loading = false
        }
      },

      async searchExamens(filters = {}) {
        this.searching = true
        this.error = ''

        this.filters = {
          q: filters.q ?? '',
          statut:
            filters.statut ?? '',
          type: filters.type ?? '',
        }

        try {
          return await this.fetchExamens({
            page: 1,
            q: this.filters.q,
            statut:
              this.filters.statut,
            type: this.filters.type,
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
          const payload =
            await imagerieService.getById(
              id,
            )

          const normalized =
            normalizeSingleResponse(
              payload,
            )

          if (!normalized) {
            throw new Error(
              'Cet examen ne relève pas du périmètre Imagerie.',
            )
          }

          this.selectedExamen =
            normalized

          return normalized
        } catch (error) {
          this.error =
            error?.message ||
            'Examen d’imagerie introuvable.'
          throw error
        } finally {
          this.loading = false
        }
      },

      async validateResult(id, payload) {
        const toast =
          useToastStore()

        this.saving = true
        this.error = ''

        try {
          const response =
            await imagerieService.validateResult(
              id,
              payload,
            )

          const updated =
            normalizeSingleResponse(
              response,
            )

          this.selectedExamen =
            updated

          const index =
            this.examens.findIndex(
              (item) =>
                String(item.id) ===
                String(id),
            )

          if (
            index >= 0 &&
            updated
          ) {
            this.examens[index] =
              updated
          }

          toast.success(
            'Compte rendu d’imagerie validé avec succès.',
          )

          return updated
        } catch (error) {
          this.error =
            error?.message ||
            'Impossible de valider le compte rendu.'
          throw error
        } finally {
          this.saving = false
        }
      },
    },
  },
)

export {
  normalizeImagerie,
  normalizeListResponse,
  normalizeSingleResponse,
  PENDING_STATUSES,
  VALIDATED_STATUS,
}
