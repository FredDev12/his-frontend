import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R3.2 — file et formulaire Triage', () => {
  it('utilise les routes backend /triages au pluriel', () => {
    const service = source(
      'src/modules/triage/services/triage.service.js',
    )

    expect(service).toContain("'/triages/queue'")
    expect(service).toContain("'/triages/reference/services'")
    expect(service).toContain("'/triages'")
    expect(service).not.toContain("'/triage'")
  })

  it('supprime la création libre depuis la file', () => {
    const page = source(
      'src/modules/triage/pages/TriageListPage.vue',
    )

    expect(page).toContain('TriageQueueTable')
    expect(page).toContain('store.fetchQueue')
    expect(page).not.toContain('to="/triage/create"')
    expect(page).not.toContain('Nouveau triage')
  })

  it('exige un episodeId issu de la file', () => {
    const page = source(
      'src/modules/triage/pages/TriageCreatePage.vue',
    )

    expect(page).toContain('route.query.episodeId')
    expect(page).toContain('store.fetchQueueItem')
    expect(page).toContain("router.replace('/triage')")
  })

  it('rend l’identité patient non modifiable', () => {
    const form = source(
      'src/modules/triage/components/TriageForm.vue',
    )

    expect(form).toContain('Identité issue de la Réception')
    expect(form).not.toContain('v-model="form.numero_patient"')
    expect(form).not.toContain('v-model="form.nom"')
    expect(form).not.toContain('v-model="form.prenom"')
  })

  it('protège la validation définitive par CONFIRMER', () => {
    const page = source(
      'src/modules/triage/pages/TriageCreatePage.vue',
    )

    expect(page).toContain('ConfirmDialog')
    expect(page).toContain(
      `:require-text="vitalEmergency ? '' : 'CONFIRMER'"`,
    )
    expect(page).toContain('Valider et orienter')
    expect(page).toContain('Activer immédiatement')
  })
})
