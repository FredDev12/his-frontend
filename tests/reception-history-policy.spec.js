import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Réception — historique administratif des passages', () => {
  it('réutilise le filtre patientId de la liste existante', () => {
    const service = source('src/modules/receptions/services/receptions.service.js')
    const store = source('src/modules/receptions/stores/receptions.store.js')

    expect(service).toContain('patientId: params.patientId')
    expect(store).toContain('patientId: String(patientId)')
  })

  it('maintient un état d’historique séparé de la liste principale', () => {
    const store = source('src/modules/receptions/stores/receptions.store.js')

    expect(store).toContain('patientHistory: []')
    expect(store).toContain('patientHistoryLoading: false')
    expect(store).toContain('patientHistoryTotal: 0')
    expect(store).toContain('fetchPatientHistory(patientId')
  })

  it('charge l’historique après le détail de la réception', () => {
    const page = source('src/modules/receptions/pages/ReceptionDetailsPage.vue')

    expect(page).toContain('await store.fetchReceptionById(id)')
    expect(page).toContain('await store.fetchPatientHistory(patientId')
    expect(page).toContain('<ReceptionHistoryCard')
  })

  it('met clairement en évidence le passage actuel', () => {
    const component = source(
      'src/modules/receptions/components/ReceptionHistoryCard.vue',
    )

    expect(component).toContain('Passage actuel')
    expect(component).toContain('currentReceptionId')
    expect(component).toContain('isCurrent(item)')
  })

  it('affiche uniquement des informations administratives', () => {
    const component = source(
      'src/modules/receptions/components/ReceptionHistoryCard.vue',
    )

    expect(component).toContain('Destination')
    expect(component).toContain('Paiement')
    expect(component).toContain('Statut de l’épisode')
    expect(component).not.toContain('Diagnostic')
    expect(component).not.toContain('Prescription')
    expect(component).not.toContain('Résultat médical')
  })

  it('permet d’ouvrir un ancien passage en lecture', () => {
    const component = source(
      'src/modules/receptions/components/ReceptionHistoryCard.vue',
    )

    expect(component).toContain('Voir ce passage')
    expect(component).toContain('`/receptions/${item.id}`')
  })

  it('charge progressivement les historiques longs', () => {
    const page = source('src/modules/receptions/pages/ReceptionDetailsPage.vue')
    const component = source(
      'src/modules/receptions/components/ReceptionHistoryCard.vue',
    )

    expect(page).toContain('loadMoreHistory')
    expect(component).toContain('Afficher plus')
    expect(component).toContain("emit('load-more')")
  })
})
