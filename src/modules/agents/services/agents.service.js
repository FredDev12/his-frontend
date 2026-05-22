import api from '@/shared/services/api'

const RESOURCE = '/agents'

function unwrapResponse(response) {
  return response?.data ?? response
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
}

export const agentsService = {
  async list(params = {}) {
    const response = await api.get(RESOURCE, {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 100,
      }),
    })

    return unwrapResponse(response)
  },

  async search(params = {}) {
    const response = await api.get(`${RESOURCE}/search`, {
      params: cleanParams({
        cac_id_co: params.cac_id_co,
        nom_post: params.nom_post,
        prenom: params.prenom,
        site: params.site,
        telephone: params.telephone,
        page: params.page || 1,
        limit: params.limit || params.limite || 100,
      }),
    })

    return unwrapResponse(response)
  },

  async statistiques() {
    const response = await api.get(`${RESOURCE}/statistiques`)
    return unwrapResponse(response)
  },

  async getByCacId(cacId) {
    const response = await api.get(`${RESOURCE}/cac/${encodeURIComponent(cacId)}`)
    return unwrapResponse(response)
  },

  async getByNumericId(id) {
    const response = await api.get(`${RESOURCE}/id/${id}`)
    return unwrapResponse(response)
  },

  async getBySite(siteName, params = {}) {
    const response = await api.get(`${RESOURCE}/site/${encodeURIComponent(siteName)}`, {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 100,
      }),
    })

    return unwrapResponse(response)
  },

  async getByFonction(fonction, params = {}) {
    const response = await api.get(`${RESOURCE}/function/${encodeURIComponent(fonction)}`, {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 100,
      }),
    })

    return unwrapResponse(response)
  },

  async getByField(fieldName, value, params = {}) {
    const response = await api.get(`${RESOURCE}/field/${encodeURIComponent(fieldName)}`, {
      params: cleanParams({
        value,
        page: params.page || 1,
        limit: params.limit || params.limite || 100,
      }),
    })

    return unwrapResponse(response)
  },
}
