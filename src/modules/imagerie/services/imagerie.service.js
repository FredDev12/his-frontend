import api from '@/shared/services/api'

export const IMAGING_TYPES = [
  'RADIOLOGIE',
  'ECHOGRAPHIE',
  'SCANNER',
  'IRM',
]

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '',
    ),
  )
}

export const imagerieService = {
  async list(params = {}) {
    return api.get('/examens', {
      params: cleanParams({
        type: params.type,
        q: params.q,
        status: params.status || params.statut,
        page: params.page || 1,
        limit:
          params.limit ||
          params.limite ||
          10,
      }),
    })
  },

  async getById(id) {
    return api.get(`/examens/${id}`)
  },

  async validateResult(id, payload) {
    return api.patch(`/examens/${id}/result`, {
      resultText: payload.resultText,
      ...(payload.resultConclusion
        ? {
            resultConclusion:
              payload.resultConclusion,
          }
        : {}),
    })
  },
}
