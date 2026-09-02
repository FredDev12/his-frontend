import api from '@/shared/services/api'

function unwrapResponse(response) {
  return response?.data ?? response
}

function unwrapItem(response) {
  return (
    response?.data?.data?.item ||
    response?.data?.item ||
    response?.data?.data ||
    response?.data ||
    response ||
    null
  )
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && value.trim() === '') return false
      return true
    }),
  )
}

function requireEpisodeId(reception) {
  const episodeId =
    reception?.episode?.id ||
    reception?.episodeId ||
    reception?.raw?.episode?.id ||
    reception?.raw?.episodeId

  if (!episodeId) {
    throw new Error("L'identifiant de l'épisode est requis pour payer la fiche d'admission.")
  }

  return String(episodeId)
}

export const receptionsService = {
  async dashboard() {
    const response = await api.get('/receptions/dashboard')
    return unwrapResponse(response)
  },

  async identityCheck(params = {}) {
    const response = await api.get('/receptions/identity-check', {
      params: cleanParams(params),
    })

    return unwrapResponse(response)
  },

  async preflight(payload) {
    const response = await api.post('/receptions/preflight', payload)
    return unwrapResponse(response)
  },

  async getFicheOpeningFeeSetting() {
    const response = await api.get('/settings/reception/fiche-opening-fee')
    return unwrapItem(response)
  },

  async list(params = {}) {
    const response = await api.get('/receptions', {
      params: cleanParams({
        page: params.page ?? 1,
        limit: params.limit ?? params.limite ?? 10,
        q: params.q,
        status: params.status,
        priority: params.priority,
        patientId: params.patientId,
        service: params.service,
        payment: params.payment,
        patientType: params.patientType,
        serviceId: params.serviceId,
      }),
    })

    return unwrapResponse(response)
  },

  async search(params = {}) {
    return this.list({
      ...params,
      page: params.page ?? 1,
      limit: params.limit ?? params.limite ?? 20,
    })
  },

  async getById(id) {
    const response = await api.get(`/receptions/${id}`)
    return unwrapResponse(response)
  },

  async create(payload) {
    const response = await api.post('/receptions', payload)
    return unwrapItem(response)
  },

  async validatePayment(reception, payload = {}) {
    const response = await api.post('/paiements/fiche', {
      episodeId: requireEpisodeId(reception),
      amount: Number(payload.amount ?? payload.montant),
      currency: payload.currency ?? payload.devise ?? 'CDF',
      mode: payload.mode ?? payload.mode_paiement,
    })

    return unwrapItem(response)
  },

  async remove(id, reason) {
    const response = await api.patch(`/receptions/${id}/status`, {
      status: 'ANNULE',
      reason,
    })

    return unwrapItem(response)
  },
}
