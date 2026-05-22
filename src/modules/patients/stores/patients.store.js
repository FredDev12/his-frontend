import { defineStore } from 'pinia'
import { patientsService } from '@/modules/patients/services/patients.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'
import { patientFullName } from '@/shared/utils/patient'

function normalizePatient(patient) {
  if (!patient) return null

  const identification =
    patient.identification_patient || patient.identificationPatient || patient.patient || patient

  return {
    raw: patient,

    id:
      patient.id ||
      patient.identifiant ||
      patient.patient_id ||
      identification.id ||
      identification.identifiant ||
      identification.patient_id,

    numero_patient:
      identification.numero_patient ||
      identification.numéro_patient ||
      patient.numero_patient ||
      patient.numéro_patient ||
      patient.numeroPatient ||
      patient.code ||
      '—',

    numero_fiche:
      patient.numero_fiche || patient.numéro_fiche || patient.fiche || patient.reference || '—',

    nom: identification.nom || patient.nom || '',
    postnom: identification.postnom || patient.postnom || '',
    prenom:
      identification.prenom || identification.prénom || patient.prenom || patient.prénom || '',

    sexe: identification.sexe || patient.sexe || '—',

    date_naissance:
      identification.date_naissance ||
      identification.dateNaissance ||
      patient.date_naissance ||
      patient.dateNaissance ||
      '',

    age: identification.age || identification.âge || patient.age || patient.âge || '',

    telephone:
      identification.telephone ||
      identification.téléphone ||
      patient.telephone ||
      patient.téléphone ||
      '',

    adresse: identification.adresse || patient.adresse || '',

    statut: patient.statut || patient.status || 'actif',

    created_at:
      patient.created_at ||
      patient.createdAt ||
      patient.créé_à ||
      patient.date_creation ||
      patient.dateCreation ||
      '',

    paiement_fiche: patient.paiement_fiche || patient.paiementFiche || {},
    agent_cac: patient.agent_cac || patient.agentCac || {},
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.patients ||
    payload?.items ||
    payload?.resultats ||
    payload?.résultats ||
    payload?.results ||
    payload

  const items = Array.isArray(rawItems) ? rawItems.map(normalizePatient).filter(Boolean) : []

  const pagination = payload?.pagination || payload?.meta || {}

  return {
    items,
    total: Number(payload?.total || pagination.total || items.length || 0),
    page: Number(payload?.page || pagination.page || 1),
    limite: Number(
      payload?.limit || payload?.limite || pagination.limit || pagination.limite || 10,
    ),
    hasNext: Boolean(payload?.hasNext || pagination.hasNext),
    hasPrev: Boolean(payload?.hasPrev || pagination.hasPrev),
  }
}

function normalizeSingleResponse(payload) {
  const patient =
    payload?.patient || payload?.data || payload?.données || payload?.result || payload

  return normalizePatient(patient)
}

export const usePatientsStore = defineStore('patients', {
  state: () => ({
    patients: [],
    selectedPatient: null,

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

    searchQuery: '',
  }),

  getters: {
    hasPatients: (state) => state.patients.length > 0,
  },

  actions: {
    async fetchPatients(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await patientsService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.patients = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.response?.data?.message || 'Impossible de charger les patients.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchPatients(query) {
      this.searchQuery = query

      if (!query || query.trim().length < 2) {
        return this.fetchPatients({
          page: 1,
        })
      }

      this.searching = true
      this.error = ''

      try {
        console.log(query)

        const payload = await patientsService.search(query.trim())
        const normalized = normalizeListResponse(payload)

        this.patients = normalized.items
        this.pagination = {
          page: 1,
          limite: normalized.items.length || 10,
          total: normalized.total || normalized.items.length,
          hasNext: false,
          hasPrev: false,
        }

        return normalized
      } catch (error) {
        this.error = error.response?.data?.message || 'Recherche patient impossible.'
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchPatientById(id) {
      this.loading = true
      this.error = ''
      this.selectedPatient = null

      try {
        const payload = await patientsService.getById(id)
        this.selectedPatient = normalizeSingleResponse(payload)

        return this.selectedPatient
      } catch (error) {
        this.error = error.response?.data?.message || 'Patient introuvable.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPatient(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await patientsService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Patient créé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PATIENTS,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'PATIENT_CREATED',
            message: 'Patient créé',
          },
        })

        return created
      } catch (error) {
        const message = error.response?.data?.message || 'Création du patient impossible.'
        this.error = message
        toast.error(message)
        console.log(error)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePatient(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await patientsService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedPatient = updated
        }

        toast.success('Patient mis à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PATIENTS,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'PATIENT_UPDATED',
            message: 'Patient mis à jour',
          },
        })

        return updated
      } catch (error) {
        const message = error.response?.data?.message || 'Mise à jour du patient impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async deactivatePatient(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await patientsService.deactivate(id)

        this.patients = this.patients.filter((patient) => String(patient.id) !== String(id))

        toast.success('Patient désactivé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PATIENTS,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'PATIENT_DEACTIVATED',
            message: 'Patient désactivé',
          },
        })
      } catch (error) {
        const message = error.response?.data?.message || 'Désactivation du patient impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})
