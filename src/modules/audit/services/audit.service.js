import api from '@/shared/services/api'

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function unwrapList(response) {
  return response?.data?.data || response?.data || response
}

function unwrapItem(response) {
  return response?.data?.data?.item || response?.data?.item || response?.data?.data || response?.data
}

export const auditService = {
  async list(params = {}) {
    const response = await api.get('/audit/logs', {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 20,
        q: params.q,
        action: params.action,
        entity: params.entity || params.entite,
        entityId: params.entityId || params.entiteId,
        userId: params.userId,
        roleCode: params.roleCode || params.role,
        requestId: params.requestId,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      }),
    })

    return unwrapList(response)
  },

  async getById(id) {
    const response = await api.get(`/audit/logs/${id}`)
    return unwrapItem(response)
  },

  async getActions() {
    const response = await api.get('/audit/actions')
    return response?.data?.data?.items || response?.data?.items || []
  },

  async getByRequestId(requestId) {
    const response = await api.get(`/audit/request/${requestId}`)
    return unwrapList(response)
  },

  async getEntityHistory(entity, entityId, params = {}) {
    const response = await api.get(`/audit/entities/${entity}/${entityId}`, {
      params: cleanParams({
        page: params.page || 1,
        limit: params.limit || params.limite || 20,
      }),
    })

    return unwrapList(response)
  },
}