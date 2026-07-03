import { defineStore } from 'pinia'
import { triageService } from '@/modules/triage/services/triage.service'
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

function normalizeTriage(item) {
  if (!item) return null

  const raw = item
  const patient =
    raw.patient ||
    raw.identification_patient ||
    raw.identificationPatient ||
    raw.reception?.identification_patient ||
    {}
  const signes = raw.signes_vitaux || raw.signesVitaux || raw.vitals || {}

  return {
    raw,

    id: pick(raw, ['id', 'identifiant', 'triage_id']),

    reception_id: pick(raw, ['reception_id', 'receptionId'], pick(raw.reception, ['id'])),
    patient_id: pick(raw, ['patient_id', 'patientId'], pick(patient, ['id'])),

    numero_patient: pick(
      patient,
      ['numero_patient', 'numéro_patient', 'numeroPatient'],
      pick(raw, ['numero_patient', 'numeroPatient'], '—'),
    ),
    numero_fiche: pick(
      raw,
      ['numero_fiche', 'numeroFiche'],
      pick(raw.reception, ['numero_fiche', 'numeroFiche'], '—'),
    ),

    nom: pick(patient, ['nom'], pick(raw, ['nom'])),
    postnom: pick(patient, ['postnom'], pick(raw, ['postnom'])),
    prenom: pick(patient, ['prenom', 'prénom'], pick(raw, ['prenom', 'prénom'])),
    sexe: pick(patient, ['sexe'], pick(raw, ['sexe'], '—')),
    age: pick(patient, ['age', 'âge'], pick(raw, ['age', 'âge'], '')),

    temperature: pick(
      signes,
      ['temperature', 'température'],
      pick(raw, ['temperature', 'température'], ''),
    ),
    tension_arterielle: pick(
      signes,
      ['tension_arterielle', 'tension_artérielle'],
      pick(raw, ['tension_arterielle', 'tension_artérielle'], ''),
    ),
    frequence_cardiaque: pick(
      signes,
      ['frequence_cardiaque', 'fréquence_cardiaque'],
      pick(raw, ['frequence_cardiaque'], ''),
    ),
    frequence_respiratoire: pick(
      signes,
      ['frequence_respiratoire', 'fréquence_respiratoire'],
      pick(raw, ['frequence_respiratoire'], ''),
    ),
    spo2: pick(signes, ['spO2', 'spo2', 'saturation'], pick(raw, ['spO2', 'spo2'], '')),
    poids: pick(signes, ['poids'], pick(raw, ['poids'], '')),
    taille: pick(signes, ['taille'], pick(raw, ['taille'], '')),
    imc: pick(signes, ['imc'], pick(raw, ['imc'], '')),

    service_entree: pick(raw, ['service_entree', 'serviceEntree', 'service'], 'Non orienté'),
    type_passage: pick(raw, ['type_passage', 'typePassage'], 'NOUVEAU'),
    priorite: pick(raw, ['priorite', 'priorité', 'priority'], 'ROUTINE'),

    statut: pick(raw, ['statut', 'status'], 'active'),
    created_at: pick(raw, ['created_at', 'createdAt', 'date_creation'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.triages ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeTriage).filter(Boolean) : []

  const pagination = payload?.pagination || payload?.meta || {}

  const page = Number(payload?.page || pagination.page || 1)
  const limite = Number(
    payload?.limit || payload?.limite || pagination.limit || pagination.limite || 10,
  )
  const total = Number(payload?.total || pagination.total || items.length || 0)
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
  const triage = payload?.triage || payload?.data || payload?.données || payload?.result || payload

  return normalizeTriage(triage)
}

export const useTriageStore = defineStore('triage', {
  state: () => ({
    triages: [],
    selectedTriage: null,

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
      priorite: '',
      type_passage: '',
    },
  }),

  getters: {
    triageKpis: (state) => {
      const items = state.triages || []

      const isUrgent = (item) =>
        ['URGENT', 'URGENCE', 'VITALE'].includes(String(item.priorite || '').toUpperCase())

      const isHighPriority = (item) =>
        ['ELEVE', 'ÉLEVÉ', 'HIGH', 'URGENT', 'URGENCE', 'VITALE'].includes(
          String(item.priorite || '').toUpperCase()
        )

      const isOriented = (item) => {
        const service = String(item.service_entree || '').toLowerCase()
        return service && service !== 'non orienté' && service !== '—'
      }

      const isWaiting = (item) =>
        ['active', 'en_attente', 'attente'].includes(String(item.statut || '').toLowerCase())

      return {
        total: state.pagination.total || items.length,
        triagesToday: items.length,
        urgences: items.filter(isUrgent).length,
        prioriteElevee: items.filter(isHighPriority).length,
        patientsOrientes: items.filter(isOriented).length,
        patientsNonOrientes: items.filter((item) => !isOriented(item)).length,
        enAttente: items.filter(isWaiting).length,
      }
    },
  },

  actions: {
    async fetchTriages(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await triageService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.triages = normalized.items
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
          'Impossible de charger les triages.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchTriages(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        service: filters.service ?? '',
        priorite: filters.priorite ?? '',
        type_passage: filters.type_passage ?? '',
      }

      try {
        await this.fetchTriages({ page: 1 })

        const q = String(this.filters.q || '')
          .toLowerCase()
          .trim()

        this.triages = this.triages.filter((item) => {
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
              .includes(q)

          const matchesService =
            !this.filters.service || item.service_entree === this.filters.service
          const matchesPriorite = !this.filters.priorite || item.priorite === this.filters.priorite
          const matchesType =
            !this.filters.type_passage || item.type_passage === this.filters.type_passage

          return matchesQ && matchesService && matchesPriorite && matchesType
        })

        this.pagination = {
          page: 1,
          limite: this.triages.length || 10,
          total: this.triages.length,
          hasNext: false,
          hasPrev: false,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche triage impossible.'
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchTriageById(id) {
      this.loading = true
      this.error = ''
      this.selectedTriage = null

      try {
        const payload = await triageService.getById(id)
        this.selectedTriage = normalizeSingleResponse(payload)

        return this.selectedTriage
      } catch (error) {
        this.error =
          error.response?.data?.message || error.response?.data?.error || 'Triage introuvable.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTriage(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await triageService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Triage créé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.TRIAGE,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'TRIAGE_CREATED',
            message: 'Triage créé',
          },
        })
        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création du triage impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateTriage(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await triageService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedTriage = updated
        }

        toast.success('Triage mis à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.TRIAGE,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'TRIAGE_UPDATED',
            message: 'Triage mis à jour',
          },
        })
        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour du triage impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateStatus(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const status =
          payload?.status || payload?.statut || payload?.priorite || HIS_STATUSES.TRIAGE_URGENT

        const response = await statusBroadcastService.broadcast({
          module: HIS_STATUS_MODULES.TRIAGE,
          id,
          status,
          details: {
            ...payload?.details,
            numero_fiche: payload?.numero_fiche || payload?.details?.numero_fiche,
            numero_patient: payload?.numero_patient || payload?.details?.numero_patient,
            action: payload?.action || 'TRIAGE_STATUS_BROADCAST',
            message: payload?.message || 'Statut triage diffusé',
          },
        })

        toast.success('Statut triage diffusé avec succès.')
        return response
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Diffusion du statut impossible.'

        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async removeTriage(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await triageService.remove(id)

        this.triages = this.triages.filter((item) => String(item.id) !== String(id))

        toast.success('Triage supprimé avec succès.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.TRIAGE,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'TRIAGE_DELETED',
            message: 'Triage supprimé',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression du triage impossible.'
        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})


