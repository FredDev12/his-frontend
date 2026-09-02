import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Configuration Vitest autonome', () => {
  it('ne fusionne plus la configuration Vite fonctionnelle', () => {
    const config = source('vitest.config.js')

    expect(config).not.toContain('mergeConfig')
    expect(config).not.toContain("from './vite.config'")
  })

  it('conserve les plugins Vue requis', () => {
    const config = source('vitest.config.js')

    expect(config).toContain("vue()")
    expect(config).toContain("vueJsx()")
  })

  it('conserve l’alias applicatif', () => {
    const config = source('vitest.config.js')

    expect(config).toContain("'@'")
    expect(config).toContain("new URL('./src'")
  })

  it('utilise jsdom pour les composants Vue', () => {
    const config = source('vitest.config.js')

    expect(config).toContain("environment: 'jsdom'")
  })

  it('limite les tests aux dossiers officiels', () => {
    const config = source('vitest.config.js')

    expect(config).toContain("'tests/**/*.spec.js'")
    expect(config).toContain(
      "'src/__tests__/**/*.spec.js'",
    )
    expect(config).toContain("'.patch-backups/**'")
  })
})
