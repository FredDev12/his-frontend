import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  formatTriageDateTime,
  triagePriorityPresentation,
} from '../src/modules/triage/workflow/triage-create.workflow.js'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R3.3 — détail clinique lisible et traçable', () => {
  it('formate une date ISO pour un utilisateur francophone', () => {
    const formatted = formatTriageDateTime('2026-07-30T13:24:56.026Z')

    expect(formatted).not.toContain('T13:24:56.026Z')
    expect(formatted).toContain('2026')
  })

  it('explique chaque priorité clinique', () => {
    expect(triagePriorityPresentation('VITALE')).toMatchObject({
      label: 'Urgence vitale',
    })
    expect(triagePriorityPresentation('VITALE').description).toContain(
      'immédiate',
    )
  })

  it('affiche toutes les constantes et le motif', () => {
    const page = source('src/modules/triage/pages/TriageDetailsPage.vue')

    expect(page).toContain('Motif initial')
    expect(page).toContain('Fréquence cardiaque')
    expect(page).toContain('Fréquence respiratoire')
    expect(page).toContain('Glycémie')
    expect(page).toContain('Douleur')
  })

  it('affiche les premiers soins et la destination', () => {
    const page = source('src/modules/triage/pages/TriageDetailsPage.vue')

    expect(page).toContain('Premiers soins')
    expect(page).toContain('triageOrientationLabel')
    expect(page).toContain('appointment_date_time')
  })

  it('affiche l’auteur et la date de validation', () => {
    const page = source('src/modules/triage/pages/TriageDetailsPage.vue')
    const card = source('src/modules/triage/components/TriageIdentityCard.vue')

    expect(page).toContain('Réalisé par')
    expect(page).toContain('formatTriageDateTime')
    expect(card).toContain('Validé le')
    expect(card).not.toContain('Créé le : {{ dash(triage.created_at) }}')
  })
});
