import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Session frontend — renouvellement et reprise CSRF', () => {
  it('utilise le endpoint officiel de renouvellement', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain(
      'sessionRefreshClient'
    )
    expect(api).toContain(
      '.post("/auth/refresh", {})'
    )
  })

  it('renouvelle la session après expiration du token d’accès', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain('"AUTH_REQUIRED"')
    expect(api).toContain('"TOKEN_INVALID"')
    expect(api).toContain(
      'accessSessionExpired'
    )
  })

  it('récupère aussi une désynchronisation CSRF', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain('"CSRF_INVALID"')
    expect(api).toContain(
      'csrfDesynchronized'
    )
  })

  it('réutilise le nouveau CSRF avant de rejouer l’écriture', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain(
      'setCsrfToken(token)'
    )
    expect(api).toContain(
      'originalConfig.headers["X-CSRF-Token"]'
    )
    expect(api).toContain(
      'return apiClient(originalConfig)'
    )
  })

  it('ne rejoue chaque requête qu’une seule fois', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain(
      'SESSION_RETRY_FLAG'
    )
    expect(api).toContain(
      'config[SESSION_RETRY_FLAG]'
    )
  })

  it('mutualise les renouvellements simultanés', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain(
      'let refreshPromise = null'
    )
    expect(api).toContain(
      'if (!refreshPromise)'
    )
    expect(api).toContain(
      'refreshPromise = null'
    )
  })

  it('ne tente jamais de renouveler login ou refresh', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain('"/auth/login"')
    expect(api).toContain('"/auth/refresh"')
    expect(api).toContain(
      'isAuthenticationEndpoint(config)'
    )
  })

  it('redirige vers la reconnexion uniquement si le refresh échoue', () => {
    const api = source('src/shared/services/api.js')

    expect(api).toContain(
      'new CustomEvent("his:auth-required"'
    )
    expect(api).toContain(
      'normalizedRefreshError'
    )
  })
})
