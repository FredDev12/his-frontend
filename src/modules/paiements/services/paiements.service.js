import api from "@/shared/services/api"

function unwrapResponse(response) {
  return response?.data ?? response
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  )
}

export const paiementsService = {
  async list(params = {}) {
    const response = await api.get("/paiements", {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 10,
        q: params.q,
        statut: params.statut,
        factureId: params.factureId,
      }),
    })

    return unwrapResponse(response)
  },

  async getById(id) {
    const response = await api.get(`/paiements/${id}`)
    return unwrapResponse(response)
  },

  async createFacturePayment(payload) {
    const response = await api.post("/paiements/facture", payload)
    return unwrapResponse(response)
  },

  async createFichePayment(payload) {
    const response = await api.post("/paiements/fiche", payload)
    return unwrapResponse(response)
  },
}

