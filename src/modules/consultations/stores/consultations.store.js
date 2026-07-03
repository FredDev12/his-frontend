import { defineStore } from 'pinia'
import { consultationsService } from '@/modules/consultations/services/consultations.service'
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

function readText(value, fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return (
      value.resume ||
      value.résumé ||
      value.description ||
      value.valeur ||
      value.value ||
      JSON.stringify(value)
    )
  }

  return String(value)
}

function readDiagnostic(value, fallback = '') {
  if (!value) return fallback

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return readDiagnostic(parsed, fallback)
    } catch {
      return value
    }
  }

  if (typeof value === 'object') {
    const diagnosticRetenu =
      value.diagnostic_retenu ||
      value.diagnosticRetenu ||
      value.resume ||
      value.résumé ||
      value.description ||
      ''

    const hypotheses =
      value.hypotheses_diagnostiques ||
      value.hypothèses_diagnostiques ||
      value.hypotheses ||
      value.hypothèses ||
      ''

    const gravite = value.gravite || value.gravité || {}

    const graviteLabel = gravite.grave
      ? 'Grave'
      : gravite.moderee || gravite.modérée
        ? 'Modérée'
        : gravite.legere || gravite.légère
          ? 'Légère'
          : ''

    const parts = []

    if (diagnosticRetenu) {
      parts.push(`Diagnostic retenu : ${diagnosticRetenu}`)
    }

    if (hypotheses) {
      parts.push(`Hypothèses : ${hypotheses}`)
    }

    if (graviteLabel) {
      parts.push(`Gravité : ${graviteLabel}`)
    }

    return parts.join(' \n ') || fallback
  }

  return String(value)
}

function normalizeConsultation(item) {
  if (!item) return null

  const raw = item
  const patient =
    raw.patient ||
    raw.identification_patient ||
    raw.identificationPatient ||
    raw.reception?.identification_patient ||
    raw.triage?.identification_patient ||
    {}

  const pgad = raw.pgad || {}
  const etatGeneral = raw.etat_general || raw.état_général || {}
  const anamnese = raw.anamnese || {}
  const examenClinique = raw.examen_clinique || raw.examenClinique || {}
  const diagnostique = raw.diagnostique || raw.diagnostic || {}
  const plan = raw.plan_prise_en_charge || raw.planPriseEnCharge || {}

  return {
    raw,

    id: pick(raw, ['id', 'identifiant', 'consultation_id']),
    reception_id: pick(raw, ['reception_id', 'receptionId'], pick(raw.reception, ['id'])),
    triage_id: pick(raw, ['triage_id', 'triageId'], pick(raw.triage, ['id'])),

    numero_patient: pick(
      patient,
      ['numero_patient', 'numeroPatient'],
      pick(raw, ['numero_patient', 'numeroPatient'], '—'),
    ),
    numero_fiche: pick(
      raw,
      ['numero_fiche', 'numeroFiche'],
      pick(raw.reception, ['numero_fiche'], '—'),
    ),

    nom: pick(patient, ['nom'], pick(raw, ['nom'])),
    postnom: pick(patient, ['postnom'], pick(raw, ['postnom'])),
    prenom: pick(patient, ['prenom', 'prénom'], pick(raw, ['prenom', 'prénom'])),
    sexe: pick(patient, ['sexe'], pick(raw, ['sexe'], '—')),
    age: pick(patient, ['age', 'âge'], pick(raw, ['age', 'âge'], '')),

    plaintes: readText(pgad.plaintes || raw.plaintes),
    histoire: readText(pgad.histoire || raw.histoire),
    antecedents: readText(pgad.antecedents || pgad.antécédents || raw.antecedents),
    deroulement: readText(pgad.deroulement || pgad.déroulement || raw.deroulement),

    etat_general: readText(
      etatGeneral.resume || etatGeneral.résumé || etatGeneral.description || raw.etat_general,
    ),
    anamnese: readText(anamnese.resume || anamnese.résumé || anamnese.description || raw.anamnese),
    examen_clinique: readText(
      examenClinique.resume ||
        examenClinique.résumé ||
        examenClinique.description ||
        raw.examen_clinique,
    ),
    diagnostique: readDiagnostic(raw.diagnostique || raw.diagnostic || diagnostique),
    plan_prise_en_charge: readText(
      plan.resume || plan.résumé || plan.description || raw.plan_prise_en_charge,
    ),

    service: pick(raw, ['service', 'service_entree', 'serviceEntree'], 'Consultation'),
    statut: pick(raw, ['statut', 'status'], 'active'),
    created_at: pick(raw, ['created_at', 'createdAt', 'date_creation'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.consultations ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeConsultation).filter(Boolean) : []

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
  const consultation =
    payload?.consultation || payload?.data || payload?.données || payload?.result || payload

  return normalizeConsultation(consultation)
}

export const useConsultationsStore = defineStore('consultations', {
  state: () => ({
    consultations: [],
    selectedConsultation: null,

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
      service: '',
      statut: '',
    },
  }),

  getters: {
    consultationKpis: (state) => {
      const items = state.consultations || []

      const hasText = (value) => String(value || '').trim().length > 0

      const includesAny = (value, keywords = []) => {
        const text = String(value || '').toLowerCase()
        return keywords.some((keyword) => text.includes(keyword))
      }

      return {
        total: state.pagination.total || items.length,
        consultationsToday: items.length,
        patientsExamines: items.length,
        diagnosticsPoses: items.filter((item) => hasText(item.diagnostique)).length,
        examensDemandes: items.filter((item) =>
          includesAny(item.plan_prise_en_charge, ['examen', 'laboratoire', 'imagerie'])
        ).length,
        ordonnances: items.filter((item) =>
          includesAny(item.plan_prise_en_charge, ['prescription', 'ordonnance', 'traitement'])
        ).length,
        hospitalisations: items.filter((item) =>
          includesAny(item.plan_prise_en_charge, ['hospital', 'admission'])
        ).length,
        sorties: items.filter((item) =>
          includesAny(item.plan_prise_en_charge, ['sortie', 'domicile'])
        ).length,
        urgences: items.filter((item) =>
          includesAny(
            [
              item.diagnostique,
              item.plaintes,
              item.plan_prise_en_charge,
            ].join(" "),
            ["urgent", "urgence", "grave", "critique"]
          )
        ).length,
      }
    },
  },

  actions: {
    async fetchConsultations(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await consultationsService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.consultations = normalized.items
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
          'Impossible de charger les consultations.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async searchConsultations(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        service: filters.service ?? '',
        statut: filters.statut ?? '',
      }

      try {
        await this.fetchConsultations({ page: 1 })

        const q = String(this.filters.q || '')
          .toLowerCase()
          .trim()

        this.consultations = this.consultations.filter((item) => {
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
            String(item.diagnostique || '')
              .toLowerCase()
              .includes(q) ||
            String(item.plaintes || '')
              .toLowerCase()
              .includes(q) ||
            String(item.anamnese || '')
              .toLowerCase()
              .includes(q)

          const matchesService = !this.filters.service || item.service === this.filters.service
          const matchesStatut = !this.filters.statut || item.statut === this.filters.statut

          return matchesQ && matchesService && matchesStatut
        })

        this.pagination = {
          page: 1,
          limite: this.consultations.length || 10,
          total: this.consultations.length,
          hasNext: false,
          hasPrev: false,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche consultation impossible.'

        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchConsultationById(id) {
      this.loading = true
      this.error = ''
      this.selectedConsultation = null

      try {
        const payload = await consultationsService.getById(id)
        this.selectedConsultation = normalizeSingleResponse(payload)

        return this.selectedConsultation
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Consultation introuvable.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async createConsultation(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await consultationsService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Consultation créée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CONSULTATIONS,
          id: created?.id,
          status: HIS_STATUSES.CONSULTATION_CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'CONSULTATION_CREATED',
            message: 'Consultation créée',
          },
        })

        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création de la consultation impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateConsultation(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await consultationsService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedConsultation = updated
        }

        toast.success('Consultation mise à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CONSULTATIONS,
          id: updated?.id || id,
          status: HIS_STATUSES.CONSULTATION_UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'CONSULTATION_UPDATED',
            message: 'Consultation mise à jour',
          },
        })

        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour de la consultation impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async removeConsultation(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await consultationsService.remove(id)

        this.consultations = this.consultations.filter((item) => String(item.id) !== String(id))

        toast.success('Consultation supprimée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.CONSULTATIONS,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'CONSULTATION_DELETED',
            message: 'Consultation supprimée',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression de la consultation impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})


