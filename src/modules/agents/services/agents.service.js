import api from '@/shared/services/api'

function unwrapPayload(response) {
  if (response?.success && response?.data !== undefined) {
    return response.data
  }

  return response
}

export const agentsService = {
  async list(params = {}) {
    const response = await api.get('/agents', {
      params: {
        page: params.page || 1,
        limit: params.limit || 100,
      },
    })

    return unwrapPayload(response)
  },

  async search(filters = {}) {
    const response = await api.get('/agents/search', {
      params: {
        cac_id_co: filters.cac_id_co || undefined,
        nom_post: filters.nom_post || undefined,
        prenom: filters.prenom || undefined,
        site: filters.site || undefined,
        telephone: filters.telephone || undefined,
        page: filters.page || 1,
        limit: filters.limit || 100,
      },
    })

    return unwrapPayload(response)
  },

  async statistiques() {
    const response = await api.get('/agents/statistiques')
    return unwrapPayload(response)
  },

  async getByCacId(cacId) {
    const response = await api.get(`/agents/cac/${encodeURIComponent(cacId)}`)
    return unwrapPayload(response)
  },

  async getByNumericId(id) {
    const response = await api.get(`/agents/id/${encodeURIComponent(id)}`)
    return unwrapPayload(response)
  },

  async getBySite(siteName, params = {}) {
    const response = await api.get(`/agents/site/${encodeURIComponent(siteName)}`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 100,
      },
    })

    return unwrapPayload(response)
  },

  async getByFonction(fonction, params = {}) {
    const response = await api.get(`/agents/function/${encodeURIComponent(fonction)}`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 100,
      },
    })

    return unwrapPayload(response)
  },

  async getByField(fieldName, value, params = {}) {
    const response = await api.get(`/agents/field/${encodeURIComponent(fieldName)}`, {
      params: {
        value,
        page: params.page || 1,
        limit: params.limit || 100,
      },
    })

    return unwrapPayload(response)
  },
}
