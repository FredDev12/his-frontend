import { defineStore } from 'pinia'
import { pharmacieService } from '@/modules/pharmacie/services/pharmacie.service'
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

function normalizeMedicament(item) {
  if (!item) return null

  return {
    medicament: pick(item, ['medicament', 'médicament', 'nom', 'name'], '—'),
    dosage: pick(item, ['dosage', 'dose'], ''),
    frequence: pick(item, ['frequence', 'fréquence', 'frequency'], ''),
    duree: pick(item, ['duree', 'durée', 'duration'], ''),
    quantite: Number(pick(item, ['quantite', 'quantité', 'quantity'], 1)) || 1,
    instructions: pick(item, ['instructions', 'instruction', 'notes'], ''),
    delivre: Boolean(pick(item, ['delivre', 'délivré', 'delivered'], false)),
    raw: item,
  }
}

function resolveStatus(medicaments, rawStatus = '') {
  if (rawStatus) return rawStatus

  if (!medicaments.length) return 'pending'

  const deliveredCount = medicaments.filter((item) => item.delivre).length

  if (deliveredCount === 0) return 'pending'
  if (deliveredCount === medicaments.length) return 'delivered'

  return 'partial'
}

function normalizePrescription(item) {
  if (!item) return null

  const raw = item

  const patient =
    raw.patient ||
    raw.identification_patient ||
    raw.identificationPatient ||
    raw.consultation?.identification_patient ||
    raw.reception?.identification_patient ||
    {}

  const medicamentsRaw = raw.medicaments || raw.médicaments || raw.prescriptions || raw.items || []

  const medicaments = Array.isArray(medicamentsRaw)
    ? medicamentsRaw.map(normalizeMedicament).filter(Boolean)
    : [normalizeMedicament(medicamentsRaw)].filter(Boolean)

  const firstMedicament = medicaments[0] || {}

  return {
    raw,

    id: pick(raw, ['id', 'identifiant', 'pharmacie_id', 'prescription_id']),
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

    medicament_principal:
      firstMedicament.medicament || pick(raw, ['medicament', 'médicament'], '—'),
    dosage: firstMedicament.dosage || pick(raw, ['dosage'], ''),
    frequence: firstMedicament.frequence || pick(raw, ['frequence', 'fréquence'], ''),
    duree: firstMedicament.duree || pick(raw, ['duree', 'durée'], ''),
    quantite: firstMedicament.quantite || Number(pick(raw, ['quantite', 'quantité'], 1)) || 1,

    medicaments,
    statut: resolveStatus(medicaments, pick(raw, ['statut', 'status'], '')),
    created_at: pick(raw, ['created_at', 'createdAt', 'date_creation'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.données ||
    payload?.pharmacie ||
    payload?.prescriptions ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizePrescription).filter(Boolean) : []

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
  const prescription =
    payload?.pharmacie ||
    payload?.prescription ||
    payload?.data ||
    payload?.données ||
    payload?.result ||
    payload

  return normalizePrescription(prescription)
}

function buildDeliveredPayload(prescription) {
  const medicaments = prescription.medicaments.map((item) => ({
    medicament: item.medicament,
    dosage: item.dosage || undefined,
    frequence: item.frequence || undefined,
    duree: item.duree || undefined,
    quantite: Number(item.quantite) || 1,
    instructions: item.instructions || undefined,
    delivre: true,
  }))

  return {
    medicaments,
  }
}

export const usePharmacieStore = defineStore('pharmacie', {
  state: () => ({
    prescriptions: [],
    selectedPrescription: null,

    loading: false,
    saving: false,
    deleting: false,
    delivering: false,
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
    },
  }),

  getters: {
    pharmacieKpis: (state) => {
      const items = state.prescriptions || []

      const statusOf = (item) => String(item.statut || '').toLowerCase()

      const isPending = (item) =>
        ['pending', 'en_attente', 'attente'].includes(statusOf(item))

      const isDelivered = (item) =>
        ['delivered', 'delivre', 'délivré', 'served'].includes(statusOf(item))

      const isPartial = (item) => statusOf(item) === 'partial'

      const totalMedicaments = items.reduce((sum, item) => {
        return sum + (Array.isArray(item.medicaments) ? item.medicaments.length : 0)
      }, 0)

      return {
        total: state.pagination.total || items.length,
        prescriptionsToday: items.length,
        aServir: items.filter(isPending).length,
        delivrees: items.filter(isDelivered).length,
        partielles: items.filter(isPartial).length,
        medicaments: totalMedicaments,
        patients: new Set(items.map((item) => item.numero_patient).filter(Boolean)).size,
        alertesStock: 0,
      }
    },
  },

  actions: {
    async fetchPrescriptions(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await pharmacieService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.prescriptions = normalized.items
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
          'Impossible de charger les prescriptions.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async searchPrescriptions(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
      }

      try {
        await this.fetchPrescriptions({ page: 1 })

        const q = String(this.filters.q || '')
          .toLowerCase()
          .trim()

        this.prescriptions = this.prescriptions.filter((item) => {
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
            String(item.medicament_principal || '')
              .toLowerCase()
              .includes(q) ||
            String(item.dosage || '')
              .toLowerCase()
              .includes(q) ||
            item.medicaments.some((medicament) =>
              String(medicament.medicament || '')
                .toLowerCase()
                .includes(q),
            )

          const matchesStatut = !this.filters.statut || item.statut === this.filters.statut

          return matchesQ && matchesStatut
        })

        this.pagination = {
          page: 1,
          limite: this.prescriptions.length || 10,
          total: this.prescriptions.length,
          hasNext: false,
          hasPrev: false,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche pharmacie impossible.'

        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchPrescriptionById(id) {
      this.loading = true
      this.error = ''
      this.selectedPrescription = null

      try {
        const payload = await pharmacieService.getById(id)
        this.selectedPrescription = normalizeSingleResponse(payload)

        return this.selectedPrescription
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Prescription introuvable.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async createPrescription(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await pharmacieService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Prescription créée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PHARMACIE,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            numero_fiche: created?.numero_fiche,
            numero_patient: created?.numero_patient,
            patient: patientFullName(created),
            action: 'PHARMACY_PRESCRIPTION_CREATED',
            message: 'Prescription pharmacie créée',
          },
        })

        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création de la prescription impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updatePrescription(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await pharmacieService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedPrescription = updated
        }

        toast.success('Prescription mise à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PHARMACIE,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            numero_fiche: updated?.numero_fiche,
            numero_patient: updated?.numero_patient,
            patient: patientFullName(updated),
            action: 'PHARMACY_PRESCRIPTION_UPDATED',
            message: 'Prescription pharmacie mise à jour',
          },
        })

        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour de la prescription impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async deliverPrescription(prescription) {
      const toast = useToastStore()

      this.delivering = true
      this.error = ''

      try {
        const payload = buildDeliveredPayload(prescription)

        const response = await pharmacieService.update(prescription.id, payload)
        const updated = normalizeSingleResponse(response)

        this.prescriptions = this.prescriptions.map((item) =>
          String(item.id) === String(prescription.id)
            ? updated || {
                ...item,
                statut: 'delivered',
                medicaments: item.medicaments.map((medicament) => ({
                  ...medicament,
                  delivre: true,
                })),
              }
            : item,
        )

        toast.success('Médicaments délivrés avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PHARMACIE,
          id: prescription.id,
          status: HIS_STATUSES.PHARMACY_DELIVERED,
          details: {
            numero_fiche: prescription.numero_fiche,
            numero_patient: prescription.numero_patient,
            patient: patientFullName(prescription),
            action: 'PHARMACY_DELIVERED',
            message: 'Médicaments délivrés',
          },
        })

        return updated
      } catch (error) {
        const message =
          error.response?.data?.message || error.response?.data?.error || 'Délivrance impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.delivering = false
      }
    },

    async removePrescription(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await pharmacieService.remove(id)

        this.prescriptions = this.prescriptions.filter((item) => String(item.id) !== String(id))

        toast.success('Prescription supprimée avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.PHARMACIE,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'PHARMACY_PRESCRIPTION_DELETED',
            message: 'Prescription pharmacie supprimée',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression de la prescription impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})

