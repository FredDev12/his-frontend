import { defineStore } from "pinia"
import { paiementsService } from "@/modules/paiements/services/paiements.service"
import { useToastStore } from "@/shared/stores/toast.store"

function pick(obj, keys, fallback = "") {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key]
    }
  }

  return fallback
}

function normalizePaiement(item) {
  if (!item) return null

  const raw = item
  const facture = raw.facture || {}

  return {
    raw,
    id: pick(raw, ["id"]),
    uuid: pick(raw, ["uuid"]),
    paiementCode: pick(raw, ["paiementCode", "paiement_code", "code"], `PAY-${pick(raw, ["id"], "")}`),
    factureId: pick(raw, ["factureId", "facture_id"], pick(facture, ["id"])),
    factureNumber: pick(raw, ["factureNumber", "facture_number"], pick(facture, ["factureNumber", "numero"])),
    patientId: pick(raw, ["patientId", "patient_id"]),
    episodeId: pick(raw, ["episodeId", "episode_id"]),
    amount: Number(pick(raw, ["amount", "montant"], 0)),
    currency: pick(raw, ["currency", "devise"], "CDF"),
    method: pick(raw, ["method", "mode", "paymentMethod"], "cash"),
    status: pick(raw, ["status", "statut"], "completed"),
    reference: pick(raw, ["reference", "transactionReference"], ""),
    notes: pick(raw, ["notes"], ""),
    createdAt: pick(raw, ["createdAt", "created_at"], ""),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data?.items ||
    payload?.data ||
    payload?.items ||
    payload?.paiements ||
    payload?.results ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizePaiement).filter(Boolean) : []
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
  return normalizePaiement(payload?.data?.item || payload?.data || payload?.paiement || payload)
}

export const usePaiementsStore = defineStore("paiements", {
  state: () => ({
    paiements: [],
    selectedPaiement: null,

    loading: false,
    saving: false,
    cancelling: false,
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
      statut: "",
      factureId: "",
    },
  }),

  getters: {
    caisseKpis: (state) => {
      const items = state.paiements || []

      const completed = (item) => ["completed", "paid", "valide", "validé"].includes(String(item.status).toLowerCase())
      const cancelled = (item) => ["cancelled", "canceled", "annule", "annulé"].includes(String(item.status).toLowerCase())

      return {
        total: state.pagination.total || items.length,
        paiementsToday: items.length,
        paiementsValides: items.filter(completed).length,
        paiementsAnnules: items.filter(cancelled).length,
        montantEncaisse: items.filter(completed).reduce((sum, item) => sum + Number(item.amount || 0), 0),
        montantAnnule: items.filter(cancelled).reduce((sum, item) => sum + Number(item.amount || 0), 0),
        devise: items[0]?.currency || "CDF",
      }
    },
  },

  actions: {
    async fetchPaiements(params = {}) {
      this.loading = true
      this.error = ""

      try {
        const payload = await paiementsService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
          q: params.q ?? this.filters.q,
          statut: params.statut ?? this.filters.statut,
          factureId: params.factureId ?? this.filters.factureId,
        })

        const normalized = normalizeListResponse(payload)

        this.paiements = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Impossible de charger les paiements."
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPaiement(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ""

      try {
        const response = await paiementsService.createFacturePayment(payload)
        const created = normalizeSingleResponse(response)

        toast.success("Paiement enregistré avec succès.")

        if (created) {
          this.paiements = [created, ...this.paiements]
        }

        return created
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Création paiement impossible."
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async cancelPaiement(id, payload = {}) {
      const toast = useToastStore()

      this.cancelling = true
      this.error = ""

      try {
        const response = await paiementsService.cancel(id, payload)
        const cancelled = normalizeSingleResponse(response)

        this.paiements = this.paiements.map((item) =>
          String(item.id) === String(id) ? cancelled || { ...item, status: "cancelled" } : item,
        )

        toast.success("Paiement annulé avec succès.")

        return cancelled
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Annulation paiement impossible."
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.cancelling = false
      }
    },
  },
})

