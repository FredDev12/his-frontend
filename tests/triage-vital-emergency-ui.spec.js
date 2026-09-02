import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  findVitalEmergencyService,
  isVitalTriagePriority,
} from '../src/modules/triage/workflow/triage-create.workflow.js'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R3.4B — urgence vitale frontend', () => {
  it('identifie uniquement VITALE', () => {
    expect(isVitalTriagePriority('VITALE')).toBe(true)
    expect(isVitalTriagePriority('TRES_URGENT')).toBe(false)
  })

  it('retrouve uniquement le service URGENCES autorisé', () => {
    const service = findVitalEmergencyService([
      {
        id: '1',
        code: 'MEDECINE_GENERALE',
        canReceiveTriage: true,
      },
      {
        id: '2',
        code: 'URGENCES',
        canReceiveTriage: true,
      },
    ])

    expect(service.id).toBe('2')
  })

  it('impose automatiquement urgence, service et consultation', () => {
    const form = source(
      'src/modules/triage/components/TriageForm.vue',
    )

    expect(form).toContain("form.typePassage = 'URGENCE'")
    expect(form).toContain(
      "form.orientationTargetModule = 'CONSULTATION'",
    )
    expect(form).toContain('vitalEmergencyService')
  })

  it('utilise une confirmation rapide sans saisie CONFIRMER', () => {
    const page = source(
      'src/modules/triage/pages/TriageCreatePage.vue',
    )

    expect(page).toContain(
      `:require-text="vitalEmergency ? \'\' : \'CONFIRMER\'"`,
    )
    expect(page).toContain('Activer immédiatement')
  })

  it('utilise le variant emergency', () => {
    const form = source(
      'src/modules/triage/components/TriageForm.vue',
    )

    expect(form).toContain(
      `:variant="emergency ? 'emergency' : 'success'"`,
    )
    expect(form).toContain('Activer l’urgence vitale')
  })
})
