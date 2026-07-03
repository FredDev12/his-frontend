import { defineStore } from "pinia"
import { sortiesService } from "@/modules/sorties/services/sorties.service"
import { useToastStore } from "@/shared/stores/toast.store"

function pick(obj, keys, fallback = "") {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key]
  }
  return fallback
}

function normalizeSortie(item) {
  if (!item) return null
  const patient = item.patient || item.identification_patient || {}

  return {
    raw: item,
    id: pick(item, ["id"]),
    sortieCode: pick(item, ["sortieCode", "sortie_code", "code"], `SORTIE-${pick(item, ["id"], "")}`),
    episodeId: pick(item, ["episodeId", "episode_id"]),
    patientId: pick(item, ["patientId", "patient_id"]),
    numero_patient: pick(patient, ["numero_patient"], pick(item, ["numero_patient"], "—")),
    numero_fiche: pick(item, ["numero_fiche", "numeroFiche"], "—"),
    nom: pick(patient, ["nom"], pick(item, ["nom"])),
    postnom: pick(patient, ["postnom"], pick(item, ["postnom"])),
    prenom: pick(patient, ["prenom"], pick(item, ["prenom"])),
    motif: pick(item, ["motif", "reason"], ""),
    resume: pick(item, ["resume", "summary"], ""),
    recommandations: pick(item, ["recommandations", "recommendations"], ""),
    status: pick(item, ["status", "statut"], "VALIDEE"),
    createdAt: pick(item, ["createdAt", "created_at"], ""),
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.data?.items || payload?.data || payload?.items || payload?.sorties || []
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeSortie).filter(Boolean) : []
  const pagination = payload?.data?.pagination || payload?.pagination || {}

  const page = Number(pagination.page || payload?.page || 1)
  const limite = Number(pagination.limit || pagination.limite || payload?.limit || 10)
  const total = Number(pagination.total || payload?.total || items.length || 0)
  const totalPages = Number(pagination.pages || pagination.totalPages || Math.ceil(total / limite) || 1)

  return { items, page, limite, total, hasNext: page < totalPages, hasPrev: page > 1 }
}

function normalizeSingleResponse(payload) {
  return normalizeSortie(payload?.data?.item || payload?.data || payload?.sortie || payload)
}

export const useSortiesStore = defineStore("sorties", {
  state: () => ({
    sorties: [],
    selectedSortie: null,
    loading: false,
    loadingDetails: false,
    saving: false,
    error: "",
    pagination: {
      page: 1,
      limite: 10,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },
  }),

  getters: {
    sortieKpis: (state) => {
      const items = state.sorties || []
      return {
        total: state.pagination.total || items.length,
        sortiesToday: items.length,
        sortiesValidees: items.filter((item) =>
          ["VALIDEE", "VALIDÉE", "SORTI", "SORTIE"].includes(String(item.status).toUpperCase())
        ).length,
        patientsSortis: new Set(items.map((item) => item.patientId).filter(Boolean)).size,
      }
    },
  },

  actions: {
    async fetchSorties(params = {}) {
      this.loading = true
      this.error = ""

      try {
        const payload = await sortiesService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)
        this.sorties = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Impossible de charger les sorties."
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSortieById(id) {
      this.loadingDetails = true
      this.error = ""
      this.selectedSortie = null

      try {
        const payload = await sortiesService.getById(id)
        this.selectedSortie = normalizeSingleResponse(payload)
        return this.selectedSortie
      } finally {
        this.loadingDetails = false
      }
    },

    async createSortie(payload) {
      const toast = useToastStore()
      this.saving = true
      this.error = ""

      try {
        const response = await sortiesService.create(payload)
        const created = normalizeSingleResponse(response)

        if (created) this.sorties = [created, ...this.sorties]

        toast.success("Sortie patient enregistrée avec succès.")
        return created
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Création sortie impossible."
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
