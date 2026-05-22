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

function safeParseJson(value) {
  if (!value) return null

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
  const action = String(value || '')
    .toUpperCase()
    .trim()

  const map = {
    CREATE: 'CREATE',
    CREATED: 'CREATE',
    CREATION: 'CREATE',

    UPDATE: 'UPDATE',
    UPDATED: 'UPDATE',
    MODIFICATION: 'UPDATE',

    DELETE: 'DELETE',
    DELETED: 'DELETE',
    SUPPRESSION: 'DELETE',

    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',

    VALIDATE: 'VALIDATE',
    VALIDATED: 'VALIDATE',
    VALIDATION: 'VALIDATE',

    CANCEL: 'CANCEL',
    CANCELLED: 'CANCEL',
    ANNULATION: 'CANCEL',

    RESET_PASSWORD: 'RESET_PASSWORD',
    PASSWORD_RESET: 'RESET_PASSWORD',
  }

  return map[action] || action || 'UNKNOWN'
}

function normalizeAudit(item) {
  if (!item) return null

  const raw = item

  const ancienneValeur = safeParseJson(
    pick(raw, ['ancienne_valeur', 'ancienneValeur', 'old_value', 'oldValue', 'before'], null),
  )

  const nouvelleValeur = safeParseJson(
    pick(raw, ['nouvelle_valeur', 'nouvelleValeur', 'new_value', 'newValue', 'after'], null),
  )

  const utilisateur = raw.utilisateur || raw.user || raw.actor || {}

  return {
    raw,

    id: pick(raw, ['id', '_id', 'audit_id', 'auditId']),
    user_id: pick(raw, ['user_id', 'userId'], pick(utilisateur, ['id'])),
    user_nom: pick(
      raw,
      ['user_nom', 'userName', 'nom_utilisateur'],
      pick(utilisateur, ['nom', 'name']),
    ),
    user_email: pick(raw, ['user_email', 'email'], pick(utilisateur, ['email'])),

    role: pick(raw, ['role', 'user_role', 'userRole'], pick(utilisateur, ['role'])),

    action: normalizeAction(pick(raw, ['action', 'event', 'operation'], 'UNKNOWN')),
    entite: pick(raw, ['entite', 'entity', 'entity_name', 'entityName', 'module'], '—'),
    entite_id: pick(
      raw,
      ['entite_id', 'entiteId', 'entity_id', 'entityId', 'record_id', 'recordId'],
      '',
    ),

    ancienne_valeur: ancienneValeur,
    nouvelle_valeur: nouvelleValeur,

    ip: pick(raw, ['ip', 'ip_address', 'ipAddress'], ''),
    user_agent: pick(raw, ['user_agent', 'userAgent'], ''),
    request_id: pick(raw, ['request_id', 'requestId', 'correlation_id', 'correlationId'], ''),

    description: pick(raw, ['description', 'message', 'details'], ''),
    created_at: pick(raw, ['created_at', 'createdAt', 'timestamp', 'date'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.audits ||
    payload?.logs ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeAudit).filter(Boolean) : []

  const pagination = payload?.pagination || payload?.meta || {}

  const page = Number(payload?.page || pagination.page || pagination.currentPage || 1)

  const limite = Number(
    payload?.limit ||
      payload?.limite ||
      pagination.limit ||
      pagination.limite ||
      pagination.perPage ||
      20,
  )

  const total = Number(
    payload?.total ||
      payload?.count ||
      pagination.total ||
      pagination.totalItems ||
      items.length ||
      0,
  )

  const totalPages = Number(
    payload?.pages ||
      payload?.totalPages ||
      pagination.pages ||
      pagination.totalPages ||
      Math.ceil(total / limite) ||
      1,
  )

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
  const audit =
    payload?.audit ||
    payload?.log ||
    payload?.data ||
    payload?.données ||
    payload?.result ||
    payload

  return normalizeAudit(audit)
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export const useAuditStore = defineStore('audit', {
  state: () => ({
    audits: [],
    selectedAudit: null,

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
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        action: filters.action ?? '',
        entite: filters.entite ?? '',
        role: filters.role ?? '',
      }

      try {
        await this.fetchAudits({
          page: 1,
          limit: 100,
        })

        const q = normalizeText(this.filters.q)
        const action = normalizeText(this.filters.action)
        const entite = normalizeText(this.filters.entite)
        const role = normalizeText(this.filters.role)

        const filtered = this.audits.filter((item) => {
          const searchableText = normalizeText(
            [
              item.id,
              item.user_id,
              item.user_nom,
              item.user_email,
              item.role,
              item.action,
              item.entite,
              item.entite_id,
              item.ip,
              item.user_agent,
              item.request_id,
              item.description,
            ].join(' '),
          )

          const matchesQ = !q || searchableText.includes(q)
          const matchesAction = !action || normalizeText(item.action) === action
          const matchesEntite = !entite || normalizeText(item.entite).includes(entite)
          const matchesRole = !role || normalizeText(item.role) === role

          return matchesQ && matchesAction && matchesEntite && matchesRole
        })

        this.audits = filtered
        this.pagination = {
          page: 1,
          limite: filtered.length || 20,
          total: filtered.length,
          hasNext: false,
          hasPrev: false,
        }

        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          limite: filtered.length || 20,
          hasNext: false,
          hasPrev: false,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche audit impossible.'

        throw error
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
          'Journal d’audit introuvable.'

        throw error
      } finally {
        this.loadingDetails = false
      }
    },
  },
})
