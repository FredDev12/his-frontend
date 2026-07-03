import { defineStore } from "pinia"
import { hospitalisationService } from "@/modules/hospitalisation/services/hospitalisation.service"
import { useToastStore } from "@/shared/stores/toast.store"

function pick(obj, keys, fallback = "") {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key]
    }
  }

  return fallback
}

function normalizeHospitalisation(item) {
  if (!item) return null

  const raw = item
  const patient = raw.patient || raw.identification_patient || raw.identificationPatient || {}

  return {
    raw,
    id: pick(raw, ["id"]),
    uuid: pick(raw, ["uuid"]),
    hospitalisationCode: pick(raw, ["hospitalisationCode", "hospitalisation_code", "code"], `HOSP-${pick(raw, ["id"], "")}`),
    episodeId: pick(raw, ["episodeId", "episode_id"]),
    patientId: pick(raw, ["patientId", "patient_id"]),

    numero_patient: pick(patient, ["numero_patient", "numeroPatient"], pick(raw, ["numero_patient", "numeroPatient"], "—")),
    numero_fiche: pick(raw, ["numero_fiche", "numeroFiche"], "—"),
    nom: pick(patient, ["nom"], pick(raw, ["nom"])),
    postnom: pick(patient, ["postnom"], pick(raw, ["postnom"])),
    prenom: pick(patient, ["prenom"], pick(raw, ["prenom"])),

    serviceId: pick(raw, ["serviceId", "service_id"]),
    serviceName: pick(raw.service, ["name", "nom"], pick(raw, ["serviceName", "service_name"], "—")),
    bedNumber: pick(raw, ["bedNumber", "bed_number", "lit"], "—"),
    roomNumber: pick(raw, ["roomNumber", "room_number", "chambre"], "—"),
    admissionReason: pick(raw, ["admissionReason", "admission_reason", "motif"], ""),
    dischargeSummary: pick(raw, ["dischargeSummary", "discharge_summary"], ""),
    recommendations: pick(raw, ["recommendations"], ""),
    status: pick(raw, ["status", "statut"], "ACTIVE"),
    admittedAt: pick(raw, ["admittedAt", "admitted_at"], ""),
    dischargedAt: pick(raw, ["dischargedAt", "discharged_at"], ""),
    createdAt: pick(raw, ["createdAt", "created_at"], ""),
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.data?.items || payload?.data || payload?.items || payload?.hospitalisations || payload?.results || []
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeHospitalisation).filter(Boolean) : []
  const pagination = payload?.data?.pagination || payload?.pagination || payload?.meta || {}

  const page = Number(pagination.page || payload?.page || 1)
  const limite = Number(pagination.limit || pagination.limite || payload?.limit || 10)
  const total = Number(pagination.total || payload?.total || items.length || 0)
  const totalPages = Number(pagination.pages || pagination.totalPages || Math.ceil(total / limite) || 1)

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
  return normalizeHospitalisation(payload?.data?.item || payload?.data || payload?.hospitalisation || payload)
}

export const useHospitalisationStore = defineStore("hospitalisation", {
  state: () => ({
    hospitalisations: [],
    selectedHospitalisation: null,

    loading: false,
    loadingDetails: false,
    saving: false,
    discharging: false,
    searching: false,

    error: "",

    pagination: {
      page: 1,
      limite: 10,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    filters: {
      q: "",
      status: "",
      serviceId: "",
    },
  }),

  getters: {
    hospitalisationKpis: (state) => {
      const items = state.hospitalisations || []

      const isActive = (item) => ["ACTIVE", "ADMISE", "EN_COURS"].includes(String(item.status || "").toUpperCase())
      const isDischarged = (item) => ["DISCHARGED", "SORTIE", "TERMINEE", "TERMINÉE"].includes(String(item.status || "").toUpperCase())

      return {
        total: state.pagination.total || items.length,
        actives: items.filter(isActive).length,
        sorties: items.filter(isDischarged).length,
        admissionsToday: items.length,
        litsOccupes: items.filter(isActive).length,
        litsDisponibles: 0,
        tauxOccupation: items.length ? Math.round((items.filter(isActive).length / items.length) * 100) : 0,
      }
    },
  },

  actions: {
    async fetchHospitalisations(params = {}) {
      this.loading = true
      this.error = ""

      try {
        const payload = await hospitalisationService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
          q: params.q ?? this.filters.q,
          status: params.status ?? this.filters.status,
          serviceId: params.serviceId ?? this.filters.serviceId,
        })

        const normalized = normalizeListResponse(payload)

        this.hospitalisations = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Impossible de charger les hospitalisations."
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchHospitalisationById(id) {
      this.loadingDetails = true
      this.error = ""
      this.selectedHospitalisation = null

      try {
        const payload = await hospitalisationService.getById(id)
        this.selectedHospitalisation = normalizeSingleResponse(payload)
        return this.selectedHospitalisation
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Hospitalisation introuvable."
        throw error
      } finally {
        this.loadingDetails = false
      }
    },

    async createHospitalisation(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ""

      try {
        const response = await hospitalisationService.create(payload)
        const created = normalizeSingleResponse(response)

        if (created) {
          this.hospitalisations = [created, ...this.hospitalisations]
        }

        toast.success("Hospitalisation créée avec succès.")
        return created
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Création hospitalisation impossible."
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateHospitalisation(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ""

      try {
        const response = await hospitalisationService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        this.hospitalisations = this.hospitalisations.map((item) =>
          String(item.id) === String(id) ? updated || item : item,
        )

        this.selectedHospitalisation = updated
        toast.success("Hospitalisation mise à jour.")
        return updated
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Modification hospitalisation impossible."
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async dischargeHospitalisation(id, payload = {}) {
      const toast = useToastStore()

      this.discharging = true
      this.error = ""

      try {
        const response = await hospitalisationService.discharge(id, payload)
        const updated = normalizeSingleResponse(response)

        this.hospitalisations = this.hospitalisations.map((item) =>
          String(item.id) === String(id) ? updated || { ...item, status: "DISCHARGED" } : item,
        )

        toast.success("Sortie d’hospitalisation enregistrée.")
        return updated
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Sortie hospitalisation impossible."
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.discharging = false
      }
    },
  },
})
