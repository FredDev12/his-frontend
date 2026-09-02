import { defineStore } from 'pinia'

import { triageService } from '@/modules/triage/services/triage.service'
import {
  normalizeTriageQueueItem,
  normalizeTriageQueueResponse,
  normalizeTriageServices,
} from '@/modules/triage/workflow/triage-create.workflow'
import {
  createEmptyTriageDashboard,
  normalizeTriageDashboard,
} from '@/modules/triage/workflow/triage-dashboard.workflow'
import {
  normalizeTriageReevaluation,
  normalizeTriageReevaluationList,
} from '@/modules/triage/workflow/triage-reevaluation.workflow'

import { useToastStore } from '@/shared/stores/toast.store'
import {
  HIS_STATUSES,
  HIS_STATUS_MODULES,
  statusBroadcastService,
} from '@/shared/services/status-broadcast.service'
import { patientFullName } from '@/shared/utils/patient'

function pick(object, keys, fallback = '') {
  for (const key of keys) {
    if (
      object &&
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ''
    ) {
      return object[key]
    }
  }

  return fallback
}

export function normalizeTriage(item) {
  if (!item) return null

  const raw = item
  const patient = raw.patient || {}
  const episode = raw.episode || {}
  const service = raw.requestedService || {}

  const systolic = pick(raw, ['bloodPressureSystolic'], null)
  const diastolic = pick(raw, ['bloodPressureDiastolic'], null)

  return {
    raw,
    id: String(pick(raw, ['id'], '')),
    triage_code: pick(raw, ['triageCode'], ''),

    patient_id: String(pick(patient, ['id'], '')),
    numero_patient: pick(patient, ['patientCode'], '—'),
    numero_fiche: pick(episode, ['episodeCode'], '—'),

    nom: pick(patient, ['lastName'], ''),
    postnom: pick(patient, ['middleName'], ''),
    prenom: pick(patient, ['firstName'], ''),

    temperature: pick(raw, ['temperatureCelsius'], ''),
    tension_arterielle:
      systolic !== null && diastolic !== null
        ? `${systolic}/${diastolic}`
        : '—',
    frequence_cardiaque: pick(raw, ['heartRate'], ''),
    frequence_respiratoire: pick(raw, ['respiratoryRate'], ''),
    spo2: pick(raw, ['oxygenSaturation'], ''),
    poids: pick(raw, ['weightKg'], ''),
    taille: pick(raw, ['heightCm'], ''),
    glycemie: pick(raw, ['glucoseMgDl'], ''),
    douleur: pick(raw, ['painScore'], ''),

    first_aid_performed: Boolean(pick(raw, ['firstAidPerformed'], false)),
    first_aid_notes: pick(raw, ['firstAidNotes'], ''),
    clinical_notes: pick(raw, ['clinicalNotes'], ''),

    motif_initial: pick(raw, ['motifInitial'], ''),
    service_entree: pick(service, ['name'], 'Non orienté'),
    type_passage: pick(raw, ['typePassage'], ''),
    priorite: pick(raw, ['priority'], ''),
    statut: pick(raw, ['status'], ''),
    orientation: raw.orientation || null,
    episode_status: pick(episode, ['status'], ''),
    requested_service_code: pick(service, ['code'], ''),
    orientation_target_module: pick(raw.orientation, ['targetModule'], ''),
    appointment_required: Boolean(
      pick(raw.orientation, ['appointmentRequired'], false),
    ),
    appointment_date_time: pick(
      raw.orientation,
      ['appointmentDateTime'],
      '',
    ),

    created_by: raw.createdByUser || null,
    updated_by: raw.updatedByUser || null,
    created_at: pick(raw, ['createdAt'], ''),
  }
}

function normalizeTriageList(payload) {
  const data = payload?.data || payload || {}
  const items = Array.isArray(data.items)
    ? data.items.map(normalizeTriage).filter(Boolean)
    : []

  const page = Number(data.page || 1)
  const limit = Number(data.limit || 10)
  const total = Number(data.count || items.length || 0)

  return {
    items,
    page,
    limit,
    total,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  }
}

function normalizeSingleTriage(payload) {
  const data = payload?.data || payload || {}
  return normalizeTriage(data.item || data.triage || data)
}

export const useTriageStore = defineStore('triage', {
  state: () => ({
    dashboard: createEmptyTriageDashboard(),
    dashboardLoading: false,
    dashboardError: '',

    queue: [],
    selectedQueueItem: null,
    availableServices: [],

    queueLoading: false,
    queueItemLoading: false,
    servicesLoading: false,
    queueError: '',

    queueFilters: {
      q: '',
    },

    queuePagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    triages: [],
    selectedTriage: null,

    reevaluations: [],
    reevaluationLoading: false,
    reevaluationSaving: false,
    reevaluationError: '',

    loading: false,
    saving: false,
    error: '',

    pagination: {
      page: 1,
      limite: 10,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },
  }),

  getters: {
    dashboardPriorityTotal: (state) =>
      state.dashboard.today.priorities.priorityTotal,
  },

  actions: {
    async fetchDashboard(params = {}) {
      this.dashboardLoading = true
      this.dashboardError = ''

      try {
        const payload = await triageService.getDashboard({
          timezoneOffsetMinutes:
            params.timezoneOffsetMinutes ??
            new Date().getTimezoneOffset(),
        })

        const normalized = normalizeTriageDashboard(payload)

        this.dashboard = {
          ...normalized,
          priorityTriages: normalized.priorityTriages
            .map(normalizeTriage)
            .filter(Boolean),
          recentTriages: normalized.recentTriages
            .map(normalizeTriage)
            .filter(Boolean),
          reassessment: {
            ...normalized.reassessment,
            items: normalized.reassessment.items
              .map(normalizeTriage)
              .filter(Boolean),
          },
        }

        return this.dashboard
      } catch (error) {
        this.dashboardError =
          error.message ||
          error.response?.data?.message ||
          'Impossible de charger le dashboard du triage.'
        throw error
      } finally {
        this.dashboardLoading = false
      }
    },

    async fetchQueue(params = {}) {
      this.queueLoading = true
      this.queueError = ''

      try {
        const q = params.q ?? this.queueFilters.q
        const payload = await triageService.getQueue({
          q,
          page: params.page || this.queuePagination.page,
          limit: params.limit || this.queuePagination.limit,
        })

        const normalized = normalizeTriageQueueResponse(payload)

        this.queue = normalized.items
        this.queueFilters.q = q || ''
        this.queuePagination = {
          page: normalized.page,
          limit: normalized.limit,
          total: normalized.count,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.queueError =
          error.message ||
          error.response?.data?.message ||
          'Impossible de charger la file du triage.'
        throw error
      } finally {
        this.queueLoading = false
      }
    },

    async fetchQueueItem(episodeId) {
      this.queueItemLoading = true
      this.queueError = ''
      this.selectedQueueItem = null

      try {
        const payload = await triageService.getQueueItem(episodeId)
        const data = payload?.data || payload || {}
        this.selectedQueueItem = normalizeTriageQueueItem(data.item || data)

        return this.selectedQueueItem
      } catch (error) {
        this.queueError =
          error.message ||
          error.response?.data?.message ||
          'Cet épisode n’est plus disponible dans la file du triage.'
        throw error
      } finally {
        this.queueItemLoading = false
      }
    },

    async fetchAvailableServices() {
      this.servicesLoading = true

      try {
        const payload = await triageService.getAvailableServices()
        this.availableServices = normalizeTriageServices(payload)
        return this.availableServices
      } finally {
        this.servicesLoading = false
      }
    },

    removeQueueItem(episodeId) {
      this.queue = this.queue.filter(
        (item) => String(item.episode.id) !== String(episodeId),
      )
      this.queuePagination.total = Math.max(
        0,
        this.queuePagination.total - 1,
      )

      if (
        String(this.selectedQueueItem?.episode?.id || '') ===
        String(episodeId)
      ) {
        this.selectedQueueItem = null
      }
    },

    async fetchTriages(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await triageService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeTriageList(payload)
        this.triages = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limit,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error =
          error.message ||
          error.response?.data?.message ||
          'Impossible de charger les triages.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTriageById(id) {
      this.loading = true
      this.error = ''
      this.selectedTriage = null

      try {
        const payload = await triageService.getById(id)
        this.selectedTriage = normalizeSingleTriage(payload)
        return this.selectedTriage
      } catch (error) {
        this.error =
          error.message ||
          error.response?.data?.message ||
          'Triage introuvable.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchReevaluations(triageId) {
      this.reevaluationLoading = true
      this.reevaluationError = ''

      try {
        const payload = await triageService.getReevaluations(
          triageId,
        )

        this.reevaluations =
          normalizeTriageReevaluationList(payload)

        return this.reevaluations
      } catch (error) {
        this.reevaluationError =
          error.message ||
          error.response?.data?.message ||
          'Impossible de charger les réévaluations.'
        throw error
      } finally {
        this.reevaluationLoading = false
      }
    },

    async createReevaluation(triageId, payload) {
      const toast = useToastStore()

      this.reevaluationSaving = true
      this.reevaluationError = ''

      try {
        const response =
          await triageService.createReevaluation(
            triageId,
            payload,
          )

        const data = response?.data || response || {}
        const created = normalizeTriageReevaluation(
          data.item || data,
        )

        this.reevaluations.unshift(created)

        toast.success(
          created.emergencyEscalated
            ? 'Urgence vitale activée et réévaluation enregistrée.'
            : 'Réévaluation clinique enregistrée.',
        )

        return created
      } catch (error) {
        const message =
          error.message ||
          error.response?.data?.message ||
          'Réévaluation impossible.'

        this.reevaluationError = message
        toast.error(message)
        throw error
      } finally {
        this.reevaluationSaving = false
      }
    },

    async createTriage(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await triageService.create(payload)
        const created = normalizeSingleTriage(response)

        toast.success('Triage validé et patient orienté.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.TRIAGE,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'TRIAGE_CREATED',
            message: 'Triage validé',
          },
        })

        return created
      } catch (error) {
        const message =
          error.message ||
          error.response?.data?.message ||
          'Validation du triage impossible.'

        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
