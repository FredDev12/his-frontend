import api from '@/shared/services/api'
import { auditAction } from '@/shared/utils/audit'

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

const BLOCKED_PATH_PATTERNS = [
  '/auth/change-password',
  '/auth/admin/users/reset-password',
  '/auth/admin/users/',
  '/reset-password',
  '/password',
  '/logout',
]

function normalizeMethod(method) {
  return String(method || 'GET')
    .trim()
    .toUpperCase()
}

function normalizeApiPath(path) {
  const value = String(path || '').trim()

  if (!value) {
    throw new Error('Route API obligatoire.')
  }

  if (!value.startsWith('/api/')) {
    throw new Error('La route doit commencer par /api/. Exemple : /api/patients')
  }

  // api.js a déjà baseURL: /api.
  // Donc /api/patients devient /patients pour éviter /api/api/patients.
  return value.replace(/^\/api/, '') || '/'
}

function isBlockedPath(path) {
  const normalized = String(path || '').toLowerCase()

  return BLOCKED_PATH_PATTERNS.some((pattern) => normalized.includes(pattern.toLowerCase()))
}

function parseJsonBody(rawBody) {
  const value = String(rawBody || '').trim()

  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    throw new Error('Payload JSON invalide.')
  }
}

function sanitizeResponseData(data) {
  if (!data || typeof data !== 'object') return data

  const sensitiveKeys = [
    'token',
    'access_token',
    'refresh_token',
    'authorization',
    'cookie',
    'password',
    'mot_de_passe',
    'secret',
    'csrf',
  ]

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponseData(item))
  }

  return Object.entries(data).reduce((result, [key, value]) => {
    const normalizedKey = String(key).toLowerCase()

    if (sensitiveKeys.some((sensitiveKey) => normalizedKey.includes(sensitiveKey))) {
      result[key] = '[REDACTED]'
      return result
    }

    result[key] = sanitizeResponseData(value)
    return result
  }, {})
}

export const adminRouteTestService = {
  isWriteMethod(method) {
    return WRITE_METHODS.includes(normalizeMethod(method))
  },

  validateBeforeConfirm({ method, path }) {
    const normalizedMethod = normalizeMethod(method)
    const normalizedPath = String(path || '').trim()

    if (!normalizedPath.startsWith('/api/')) {
      throw new Error('La route doit commencer par /api/.')
    }

    if (isBlockedPath(normalizedPath)) {
      throw new Error('Route sensible bloquée dans la console de test.')
    }

    return {
      method: normalizedMethod,
      path: normalizedPath,
      needsConfirmation: this.isWriteMethod(normalizedMethod),
    }
  },

  async testRoute({ method = 'GET', path = '', body = '' }) {
    const normalizedMethod = normalizeMethod(method)
    const originalPath = String(path || '').trim()

    if (isBlockedPath(originalPath)) {
      throw new Error('Route sensible bloquée dans la console de test.')
    }

    const apiPath = normalizeApiPath(originalPath)
    const parsedBody = parseJsonBody(body)

    const startedAt = performance.now()

    let response

    try {
      response = await api.request({
        method: normalizedMethod,
        url: apiPath,
        data: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)
          ? parsedBody
          : undefined,
        params: normalizedMethod === 'GET' && parsedBody ? parsedBody : undefined,
      })

      const durationMs = Math.round(performance.now() - startedAt)

      const result = {
        ok: true,
        method: normalizedMethod,
        path: originalPath,
        status: response.status,
        statusText: response.statusText || '',
        durationMs,
        data: sanitizeResponseData(response.data),
        testedAt: new Date().toISOString(),
      }

      await auditAction({
        action: 'ADMIN_ROUTE_TEST_SUCCESS',
        entity: 'administration',
        entityId: 'route-test',
        newValue: {
          method: normalizedMethod,
          path: originalPath,
          status: response.status,
          durationMs,
        },
        details: {
          method: normalizedMethod,
          path: originalPath,
          durationMs,
          writeOperation: this.isWriteMethod(normalizedMethod),
        },
        auditLevel: this.isWriteMethod(normalizedMethod) ? 'WARNING' : 'INFO',
      })

      return result
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt)

      const status = error.response?.status || 0
      const data = sanitizeResponseData(error.response?.data || null)

      const result = {
        ok: false,
        method: normalizedMethod,
        path: originalPath,
        status,
        statusText: error.response?.statusText || '',
        durationMs,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Test API échoué.',
        data,
        testedAt: new Date().toISOString(),
      }

      await auditAction({
        action: 'ADMIN_ROUTE_TEST_FAILED',
        entity: 'administration',
        entityId: 'route-test',
        newValue: {
          method: normalizedMethod,
          path: originalPath,
          status,
          durationMs,
          error: result.error,
        },
        details: {
          method: normalizedMethod,
          path: originalPath,
          durationMs,
          writeOperation: this.isWriteMethod(normalizedMethod),
        },
        auditLevel: 'WARNING',
      })

      return result
    }
  },
}
