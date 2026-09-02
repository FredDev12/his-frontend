import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R3.4B — détail et réévaluation', () => {
  it('réserve la réévaluation aux patients encore en attente', () => {
    const page = source(
      'src/modules/triage/pages/TriageDetailsPage.vue',
    )

    expect(page).toContain(
      "triage.value?.episode_status ===",
    )
    expect(page).toContain(
      "'EN_ATTENTE_CONSULTATION'",
    )
    expect(page).toContain(
      "auth.hasPermission('triage:update')",
    )
  })

  it('charge et affiche l’historique immuable', () => {
    const page = source(
      'src/modules/triage/pages/TriageDetailsPage.vue',
    )

    expect(page).toContain('store.fetchReevaluations')
    expect(page).toContain(
      'Historique des réévaluations',
    )
    expect(page).toContain('item.sequenceNumber')
  })

  it('protège la réévaluation normale par CONFIRMER', () => {
    const page = source(
      'src/modules/triage/pages/TriageDetailsPage.vue',
    )

    expect(page).toContain(
      `:require-text="vitalReevaluation ? \'\' : \'CONFIRMER\'"`,
    )
  })

  it('expose les endpoints pluriels corrects', () => {
    const service = source(
      'src/modules/triage/services/triage.service.js',
    )

    expect(service).toContain(
      '`/triages/${triageId}/reevaluations`',
    )
  })

  it('affiche les patients en attente après triage sur le dashboard', () => {
    const page = source(
      'src/modules/triage/pages/TriageDashboardPage.vue',
    )

    expect(page).toContain(
      'Patients en attente après triage',
    )
    expect(page).toContain(
      'Consulter ou réévaluer',
    )
  })
})
