import { defineStore } from 'pinia'
import { imagerieService } from '@/modules/imagerie/services/imagerie.service'
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

function normalizeExam(exam) {
  if (!exam) return null

  return {
    type: pick(exam, ['type', 'examen', 'nom', 'name'], '—'),
    zone: pick(exam, ['zone', 'region', 'région', 'partie_corps', 'partieCorps'], ''),
    indication: pick(exam, ['indication', 'motif', 'raison'], ''),
    date: pick(exam, ['date', 'date_examen', 'dateExamen'], ''),
    conclusion: pick(
      exam,
      ['conclusion', 'resultat', 'résultat', 'compte_rendu', 'compteRendu'],
      '',
    ),
    statut: pick(exam, ['statut', 'status'], ''),
    raw: exam,
  }
}

function normalizeImagerie(item) {
  if (!item) return null

  const raw = item

  const patient =
    raw.patient ||
    raw.identification_patient ||
    raw.identificationPatient ||
    raw.consultation?.identification_patient ||
    raw.reception?.identification_patient ||
    {}

  const examensRaw =
    raw.examens || raw.examens_imagerie || raw.imageries || raw.images || raw.tests || []

  const examens = Array.isArray(examensRaw)
    ? examensRaw.map(normalizeExam).filter(Boolean)
    : [normalizeExam(examensRaw)].filter(Boolean)

  const firstExam = examens[0] || {}

  const conclusionGlobale =
    examens
      .filter((exam) => exam.conclusion)
      .map((exam) => `${exam.type}: ${exam.conclusion}`)
      .join(' · ') || ''

  return {
    raw,

    id: pick(raw, ['id', 'identifiant', 'imagerie_id', 'exam_id']),
    consultation_id: pick(
      raw,
      ['consultation_id', 'consultationId'],
      pick(raw.consultation, ['id']),
    ),
    reception_id: pick(raw, ['reception_id', 'receptionId'], pick(raw.reception, ['id'])),

    numero_patient: pick(
      patient,
      ['numero_patient', 'numeroPatient'],
      pick(raw, ['numero_patient', 'numeroPatient'], '—'),
    ),

    numero_fiche: pick(
      raw,
      ['numero_fiche', 'numeroFiche'],
      pick(raw.consultation, ['numero_fiche'], pick(raw.reception, ['numero_fiche'], '—')),
    ),

    nom: pick(patient, ['nom'], pick(raw, ['nom'])),
    postnom: pick(patient, ['postnom'], pick(raw, ['postnom'])),
    prenom: pick(patient, ['prenom', 'prénom'], pick(raw, ['prenom', 'prénom'])),

    examen_principal: firstExam.type || pick(raw, ['type', 'examen'], '—'),
    zone: firstExam.zone || pick(raw, ['zone', 'region', 'région'], ''),
    indication: firstExam.indication || pick(raw, ['indication', 'motif'], ''),
    date: firstExam.date || pick(raw, ['date', 'date_examen', 'created_at'], ''),
    conclusion: conclusionGlobale || pick(raw, ['conclusion', 'resultat', 'résultat'], ''),
    examens,

    statut: pick(raw, ['statut', 'status'], conclusionGlobale ? 'completed' : 'pending'),
    created_at: pick(raw, ['created_at', 'createdAt', 'date_creation'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.imagerie ||
    payload?.imageries ||
    payload?.examens ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeImagerie).filter(Boolean) : []

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
  const examen =
    payload?.imagerie ||
    payload?.examen ||
    payload?.data ||
    payload?.données ||
    payload?.result ||
    payload

  return normalizeImagerie(examen)
}

export const useImagerieStore = defineStore('imagerie', {
  state: () => ({
    examens: [],
    selectedExamen: null,

    loading: false,
    saving: false,
    deleting: false,
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

  actions: {
    async fetchExamens(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await imagerieService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
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
          error.response?.data?.message ||
          error.response?.data?.error ||
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
        statut: filters.statut ?? '',
        type: filters.type ?? '',
      }

      try {
        await this.fetchExamens({ page: 1 })

        const q = String(this.filters.q || '')
          .toLowerCase()
          .trim()

        this.examens = this.examens.filter((item) => {
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
            String(item.examen_principal || '')
              .toLowerCase()
              .includes(q) ||
            String(item.zone || '')
              .toLowerCase()
              .includes(q) ||
            String(item.indication || '')
              .toLowerCase()
              .includes(q) ||
            String(item.conclusion || '')
              .toLowerCase()
              .includes(q)

          const matchesStatut = !this.filters.statut || item.statut === this.filters.statut
          const matchesType = !this.filters.type || item.examen_principal === this.filters.type

          return matchesQ && matchesStatut && matchesType
        })

        this.pagination = {
          page: 1,
          limite: this.examens.length || 10,
          total: this.examens.length,
          hasNext: false,
          hasPrev: false,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche imagerie impossible.'

        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchExamenById(id) {
      this.loading = true
      this.error = ''
      this.selectedExamen = null

      try {
        const payload = await imagerieService.getById(id)
        this.selectedExamen = normalizeSingleResponse(payload)

        return this.selectedExamen
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Examen d’imagerie introuvable.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async createExamen(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await imagerieService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Demande d’imagerie créée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.IMAGERIE,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'IMAGING_EXAM_CREATED',
            message: 'Demande d’imagerie créée',
          },
        })
        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création de la demande d’imagerie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateExamen(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await imagerieService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedExamen = updated
        }

        toast.success('Examen d’imagerie mis à jour avec succès.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.IMAGERIE,
          id: updated?.id || id,
          status: HIS_STATUSES.IMAGING_RESULT_AVAILABLE,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'IMAGING_RESULT_UPDATED',
            message: 'Résultat imagerie disponible ou mis à jour',
          },
        })
        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour de l’examen d’imagerie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async removeExamen(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await imagerieService.remove(id)

        this.examens = this.examens.filter((item) => String(item.id) !== String(id))

        toast.success('Examen d’imagerie supprimé avec succès.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.IMAGERIE,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'IMAGING_EXAM_DELETED',
            message: 'Examen imagerie supprimé',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression de l’examen d’imagerie impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})
