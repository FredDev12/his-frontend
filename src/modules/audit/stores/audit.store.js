import { defineStore } from 'pinia'
import { auditService } from '@/modules/audit/services/audit.service'

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }

  return fallback
}

function safeJson(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'object') return value

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  return value
}

function normalizeAction(value) {
  return String(value || 'UNKNOWN').toUpperCase().trim()
}

function normalizeAudit(item) {
  if (!item) return null

  return {
    raw: item,

    id: String(pick(item, ['id'], '')),
    user_id: pick(item, ['userId', 'user_id'], ''),
    user_nom: pick(item, ['userName', 'user_nom'], ''),
    user_email: pick(item, ['userEmail', 'user_email', 'email'], ''),

    role: pick(item, ['roleCode', 'role', 'userRole'], ''),

    action: normalizeAction(pick(item, ['action'], 'UNKNOWN')),
    entite: pick(item, ['entity', 'entite'], '—'),
    entite_id: pick(item, ['entityId', 'entite_id', 'entiteId'], ''),

    ancienne_valeur: safeJson(pick(item, ['oldValue', 'ancienne_valeur'], null)),
    nouvelle_valeur: safeJson(pick(item, ['newValue', 'nouvelle_valeur'], null)),

    ip: pick(item, ['ipAddress', 'ip', 'ip_address'], ''),
    user_agent: pick(item, ['userAgent', 'user_agent'], ''),
    request_id: pick(item, ['requestId', 'request_id'], ''),

    description: pick(item, ['description', 'message'], ''),
    created_at: pick(item, ['createdAt', 'created_at', 'timestamp'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.items || payload?.data?.items || payload?.logs || payload?.audits || []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeAudit).filter(Boolean) : []

  const page = Number(payload?.page || payload?.data?.page || 1)
  const limite = Number(payload?.limit || payload?.limite || payload?.data?.limit || 20)
  const total = Number(payload?.count || payload?.total || payload?.data?.count || items.length || 0)

  return {
    items,
    total,
    page,
    limite,
    hasNext: page * limite < total,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  return normalizeAudit(payload?.item || payload?.audit || payload?.log || payload)
}

export const useAuditStore = defineStore('audit', {
  state: () => ({
    audits: [],
    selectedAudit: null,
    actions: [],

    loading: false,
    loadingDetails: false,
    searching: false,

    error: '',

    pagination: {
      page: 1,
      limite: 20,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    filters: {
      q: '',
      action: '',
      entite: '',
      role: '',
      dateFrom: '',
      dateTo: '',
    },
  }),

  actions: {
    async fetchAudits(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await auditService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
          q: params.q ?? this.filters.q,
          action: params.action ?? this.filters.action,
          entity: params.entity ?? params.entite ?? this.filters.entite,
          roleCode: params.roleCode ?? params.role ?? this.filters.role,
          dateFrom: params.dateFrom ?? this.filters.dateFrom,
          dateTo: params.dateTo ?? this.filters.dateTo,
        })

        const normalized = normalizeListResponse(payload)

        this.audits = normalized.items
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
          'Impossible de charger les journaux d’audit.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async searchAudits(filters = {}) {
      this.searching = true

      this.filters = {
        q: filters.q ?? '',
        action: filters.action ?? '',
        entite: filters.entite ?? filters.entity ?? '',
        role: filters.role ?? filters.roleCode ?? '',
        dateFrom: filters.dateFrom ?? '',
        dateTo: filters.dateTo ?? '',
      }

      try {
        return await this.fetchAudits({
          page: 1,
          limit: this.pagination.limite,
          ...this.filters,
        })
      } finally {
        this.searching = false
      }
    },

    async fetchAuditById(id) {
      this.loadingDetails = true
      this.error = ''
      this.selectedAudit = null

      try {
        const payload = await auditService.getById(id)
        this.selectedAudit = normalizeSingleResponse(payload)

        return this.selectedAudit
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Audit introuvable.'

        throw error
      } finally {
        this.loadingDetails = false
      }
    },

    async fetchActions() {
      this.actions = await auditService.getActions()
      return this.actions
    },

    resetFilters() {
      this.filters = {
        q: '',
        action: '',
        entite: '',
        role: '',
        dateFrom: '',
        dateTo: '',
      }
    },
  },
})