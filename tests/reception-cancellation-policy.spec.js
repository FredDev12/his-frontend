import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Réception — annulation protégée', () => {
  it('exige un motif et la saisie CONFIRMER', () => {
    const page = source('src/modules/receptions/pages/ReceptionsListPage.vue')

    expect(page).toContain('v-model:reason="cancellationReason"')
    expect(page).toContain('reason-required')
    expect(page).toContain('require-text="CONFIRMER"')
    expect(page).toContain('Motif d’annulation')
  })

  it('transmet le motif au backend', () => {
    const page = source('src/modules/receptions/pages/ReceptionsListPage.vue')
    const store = source('src/modules/receptions/stores/receptions.store.js')
    const service = source('src/modules/receptions/services/receptions.service.js')

    expect(page).toContain('cancellationReason.value.trim()')
    expect(store).toContain('removeReception(id, reason)')
    expect(store).toContain('receptionsService.remove(id, reason)')
    expect(service).toContain('async remove(id, reason)')
    expect(service).toContain('reason,')
  })

  it('n’affiche l’action que tant que l’épisode attend réellement le triage', () => {
    const table = source('src/modules/receptions/components/ReceptionTable.vue')

    expect(table).toContain("receptionStatus === 'ADMIS'")
    expect(table).toContain("episodeStatus === 'EN_TRIAGE'")
  })

  it('conserve les pièces financières dans le message de conséquence', () => {
    const page = source('src/modules/receptions/pages/ReceptionsListPage.vue')

    expect(page).toContain('pièces financières déjà créées resteront conservées')
    expect(page).toContain('remboursement suivra une procédure dédiée')
  })

  it('rend le motif obligatoire dans le composant partagé sans affecter les autres dialogues', () => {
    const dialog = source('src/shared/ui/overlay/ConfirmDialog.vue')

    expect(dialog).toContain('reasonRequired')
    expect(dialog).toContain('minReasonLength')
    expect(dialog).toContain("default: false")
    expect(dialog).toContain("emit('update:reason', value)")
  })
})
