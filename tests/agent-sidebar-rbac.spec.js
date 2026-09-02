import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function principalGroup(sidebar) {
  const start = sidebar.indexOf('title: "Principal"')
  const end = sidebar.indexOf('title: "Clinique"')
  return sidebar.slice(start, end)
}

function administrationGroup(sidebar) {
  const start = sidebar.indexOf('title: "Administration"')
  return sidebar.slice(start)
}

function routeBlock(router, path) {
  const marker = `path: '${path}'`
  const markerIndex = router.indexOf(marker)

  if (markerIndex === -1) return ''

  const start = router.lastIndexOf('      {', markerIndex)
  const next = router.indexOf('\n      {', markerIndex + marker.length)

  return router.slice(start, next === -1 ? router.length : next)
}

describe('Agents CAC — sidebar Réception et RBAC', () => {
  it('place Agents CAC dans la rubrique Principal', () => {
    const sidebar = source('src/shared/ui/layout/Sidebar.vue')

    expect(principalGroup(sidebar)).toContain('label: "Agents CAC"')
    expect(administrationGroup(sidebar)).not.toContain('label: "Agents CAC"')
  })

  it('rend la rubrique disponible à la secrétaire', () => {
    const sidebar = principalGroup(
      source('src/shared/ui/layout/Sidebar.vue'),
    )

    expect(sidebar).toContain('roles: ["admin", "secretaire"]')
  })

  it('soumet la visibilité à la permission agent:read', () => {
    const sidebar = source('src/shared/ui/layout/Sidebar.vue')

    expect(sidebar).toContain('permission: "agent:read"')
    expect(sidebar).toContain('auth.hasPermission(item.permission)')
  })

  it('protège les trois routes Agents par agent:read', () => {
    const router = source('src/app/router/index.js')
    const matches = router.match(/permission: 'agent:read'/g) || []

    expect(matches).toHaveLength(3)
    expect(router).toContain("path: 'agents'")
    expect(router).toContain("path: 'agents/statistiques'")
    expect(router).toContain("path: 'agents/:id'")
  })

  it('retire le médecin du périmètre administratif Agents CAC V1', () => {
    const router = source('src/app/router/index.js')
    const paths = ['agents', 'agents/statistiques', 'agents/:id']

    for (const path of paths) {
      const block = routeBlock(router, path)

      expect(block).toContain(`path: '${path}'`)
      expect(block).toContain("roles: ['admin', 'secretaire']")
      expect(block).toContain("permission: 'agent:read'")
      expect(block).not.toContain("'medecin'")
    }
  })
})
