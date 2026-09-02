import { defineStore } from 'pinia'

import {
  createConsultationStartPayload,
  normalizeStartedConsultation,
} from '@/modules/consultations/policies/consultation-start-ui.policy'
import { consultationsService } from '@/modules/consultations/services/consultations.service'
import { patientDisplayName } from '@/shared/utils/patient'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeQueueItem(item = {}) {
  const patient = item.patient || {}
  const episode = item.episode || {}
  const triage = item.triage || {}
  const service = item.service || {}
  const site = service.site || {}
  const vitals = triage.vitals || {}

  return {
    id: episode.id || triage.id,
    patient: {
      id: patient.id || '',
      patientCode: patient.patientCode || '',
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      middleName: patient.middleName || '',
      displayName: patientDisplayName(
        { patient },
        patient.patientCode,
      ),
      gender: patient.gender || '—',
      birthDate: patient.birthDate || null,
      estimatedAge:
        patient.estimatedAge === null ||
        patient.estimatedAge === undefined
          ? null
          : toNumber(patient.estimatedAge),
    },
    episode: {
      id: episode.id || '',
      episodeCode: episode.episodeCode || '',
      status: episode.status || '',
      priority:
        episode.priority ||
        triage.priority ||
        'ROUTINE',
      motifInitial: episode.motifInitial || '',
      createdAt: episode.createdAt || null,
    },
    triage: {
      id: triage.id || '',
      triageCode: triage.triageCode || '',
      priority:
        triage.priority ||
        episode.priority ||
        'ROUTINE',
      doctorId: triage.doctorId || null,
      createdAt: triage.createdAt || null,
      latestClinicalEvaluationAt:
        triage.latestClinicalEvaluationAt ||
        triage.createdAt ||
        null,
      vitals: {
        temperatureCelsius: toNumber(
          vitals.temperatureCelsius,
        ),
        bloodPressureSystolic:
          vitals.bloodPressureSystolic === null ||
          vitals.bloodPressureSystolic === undefined
            ? null
            : toNumber(
                vitals.bloodPressureSystolic,
              ),
        bloodPressureDiastolic:
          vitals.bloodPressureDiastolic === null ||
          vitals.bloodPressureDiastolic === undefined
            ? null
            : toNumber(
                vitals.bloodPressureDiastolic,
              ),
        heartRate: toNumber(vitals.heartRate),
        respiratoryRate: toNumber(
          vitals.respiratoryRate,
        ),
        oxygenSaturation: toNumber(
          vitals.oxygenSaturation,
        ),
        painScore:
          vitals.painScore === null ||
          vitals.painScore === undefined
            ? null
            : toNumber(vitals.painScore),
      },
    },
    service: {
      id: service.id || '',
      code: service.code || '',
      name:
        service.name ||
        'Service non défini',
      site: {
        id: site.id || '',
        code: site.code || '',
        name:
          site.name ||
          'Site non défini',
      },
    },
    waitingSince:
      item.waitingSince ||
      triage.createdAt ||
      null,
    waitingMinutes: toNumber(
      item.waitingMinutes,
    ),
  }
}

function normalizeQueuePayload(payload = {}) {
  const items = Array.isArray(payload.items)
    ? payload.items.map(normalizeQueueItem)
    : []

  const page = Math.max(
    1,
    toNumber(payload.page, 1),
  )
  const limit = Math.max(
    1,
    toNumber(payload.limit, 20),
  )
  const count = Math.max(
    0,
    toNumber(payload.count, items.length),
  )

  return {
    items,
    count,
    page,
    limit,
    hasNext: page * limit < count,
    hasPrev: page > 1,
    scope: payload.scope || {
      service: null,
      doctorUserId: null,
    },
  }
}

export const useConsultationQueueStore =
  defineStore('consultationQueue', {
    state: () => ({
      items: [],
      loading: false,
      error: '',
      lastUpdatedAt: null,
      startingEpisodeId: null,
      lastStartedConsultation: null,
      filters: {
        q: '',
        priority: '',
      },
      pagination: {
        page: 1,
        limit: 20,
        count: 0,
        hasNext: false,
        hasPrev: false,
      },
      scope: {
        service: null,
        doctorUserId: null,
      },
    }),

    getters: {
      total: (state) =>
        state.pagination.count,

      vitalCount: (state) =>
        state.items.filter(
          (item) =>
            item.episode.priority ===
            'VITALE',
        ).length,

      urgentCount: (state) =>
        state.items.filter((item) =>
          ['TRES_URGENT', 'URGENT'].includes(
            item.episode.priority,
          ),
        ).length,
    },

    actions: {
      async fetchQueue(params = {}) {
        this.loading = true
        this.error = ''

        try {
          const payload =
            await consultationsService.queue({
              q:
                params.q !== undefined
                  ? params.q
                  : this.filters.q,
              priority:
                params.priority !== undefined
                  ? params.priority
                  : this.filters.priority,
              serviceId: params.serviceId,
              page:
                params.page ||
                this.pagination.page ||
                1,
              limit:
                params.limit ||
                this.pagination.limit ||
                20,
            })

          const normalized =
            normalizeQueuePayload(payload)

          this.items = normalized.items
          this.pagination = {
            page: normalized.page,
            limit: normalized.limit,
            count: normalized.count,
            hasNext: normalized.hasNext,
            hasPrev: normalized.hasPrev,
          }
          this.scope = normalized.scope
          this.lastUpdatedAt =
            new Date().toISOString()

          return normalized
        } catch (error) {
          this.items = []
          this.error =
            error?.message ||
            'Impossible de charger la file médicale.'
          throw error
        } finally {
          this.loading = false
        }
      },

      async startConsultation(item) {
        const episodeId =
          item?.episode?.id

        const payload =
          createConsultationStartPayload(
            episodeId,
          )

        this.startingEpisodeId =
          payload.episodeId
        this.error = ''

        try {
          const response =
            await consultationsService.start(
              payload,
            )

          const consultation =
            normalizeStartedConsultation(
              response,
            )

          if (!consultation?.id) {
            throw new Error(
              'Le serveur n’a pas retourné la consultation ouverte.',
            )
          }

          this.items = this.items.filter(
            (queueItem) =>
              String(
                queueItem.episode.id,
              ) !== payload.episodeId,
          )

          this.pagination.count = Math.max(
            0,
            this.pagination.count - 1,
          )

          this.pagination.hasNext =
            this.pagination.page *
              this.pagination.limit <
            this.pagination.count

          this.lastStartedConsultation =
            consultation

          return consultation
        } catch (error) {
          this.error =
            error?.message ||
            'Impossible de commencer la consultation.'
          throw error
        } finally {
          this.startingEpisodeId = null
        }
      },

      async search() {
        this.pagination.page = 1
        return this.fetchQueue({
          page: 1,
        })
      },

      async goToPage(page) {
        return this.fetchQueue({
          page,
        })
      },

      async resetFilters() {
        this.filters = {
          q: '',
          priority: '',
        }
        this.pagination.page = 1

        return this.fetchQueue({
          q: '',
          priority: '',
          page: 1,
        })
      },
    },
  })

export {
  normalizeQueueItem,
  normalizeQueuePayload,
}
