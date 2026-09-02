import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R3.4A — dashboard officiel du triage', () => {
  it('appelle le endpoint backend dédié', () => {
    const service = source(
      'src/modules/triage/services/triage.service.js',
    )

    expect(service).toContain("'/triages/dashboard'")
    expect(service).toContain('timezoneOffsetMinutes')
  })

  it('n’utilise plus les anciens KPI calculés sur dix éléments', () => {
    const page = source(
      'src/modules/triage/pages/TriageDashboardPage.vue',
    )
    const store = source(
      'src/modules/triage/stores/triage.store.js',
    )

    expect(page).not.toContain('store.triageKpis')
    expect(store).not.toContain('triageKpis:')
    expect(page).not.toContain('Patients attente')
    expect(page).not.toContain('Triages chargés')
  })

  it('affiche la file et les indicateurs de la journée locale', () => {
    const page = source(
      'src/modules/triage/pages/TriageDashboardPage.vue',
    )

    expect(page).toContain('Patients en attente')
    expect(page).toContain('Triages aujourd’hui')
    expect(page).toContain('Cas prioritaires')
    expect(page).toContain('Consultations / rendez-vous')
  })

  it('explique que les délais ne sont pas des priorités cliniques', () => {
    const page = source(
      'src/modules/triage/pages/TriageDashboardPage.vue',
    )

    expect(page).toContain(
      'Ils ne déterminent jamais la priorité clinique',
    )
  })

  it('actualise automatiquement toutes les 60 secondes', () => {
    const page = source(
      'src/modules/triage/pages/TriageDashboardPage.vue',
    )

    expect(page).toContain('window.setInterval')
    expect(page).toContain('60_000')
    expect(page).toContain('window.clearInterval')
  })

  it('affiche aussi la durée d’attente dans la file officielle', () => {
    const table = source(
      'src/modules/triage/components/TriageQueueTable.vue',
    )

    expect(table).toContain('formatTriageWaitingDuration')
    expect(table).toContain('triageWaitingPresentation')
    expect(table).toContain('Attente')
  })

  it('conserve le CTA principal vers la file officielle', () => {
    const page = source(
      'src/modules/triage/pages/TriageDashboardPage.vue',
    )

    expect(page).toContain('Ouvrir la file du triage')
    expect(page).toContain('to="/triage"')
  })
})
