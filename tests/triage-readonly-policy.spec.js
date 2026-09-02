import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R3.2 — triage validé en lecture seule', () => {
  it('retire la modification depuis le détail', () => {
    const page = source(
      'src/modules/triage/pages/TriageDetailsPage.vue',
    )

    expect(page).toContain('lecture seule')
    expect(page).not.toContain('/edit')
    expect(page).not.toContain('Modifier triage')
  })

  it('retire les raccourcis qui contournent l’orientation enregistrée', () => {
    const page = source(
      'src/modules/triage/pages/TriageDetailsPage.vue',
    )

    expect(page).not.toContain('/consultations?triageId=')
    expect(page).not.toContain('/laboratoire?triageId=')
    expect(page).toContain('ne peut pas être contournée')
  })

  it('remplace la page de modification par une information contrôlée', () => {
    const page = source(
      'src/modules/triage/pages/TriageEditPage.vue',
    )

    expect(page).toContain('Modification du triage indisponible')
    expect(page).not.toContain('TriageForm')
  })
})
