import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Réception — politique de la liste administrative', () => {
  it('retire les filtres cliniques de priorité et de service', () => {
    const content = source('src/modules/receptions/components/ReceptionSearchBar.vue')

    expect(content).not.toContain('priorityOptions')
    expect(content).not.toContain('form.priority')
    expect(content).not.toContain('serviceOptions')
    expect(content).not.toContain('form.service')
  })

  it('n’affiche plus la priorité clinique dans la table', () => {
    const content = source('src/modules/receptions/components/ReceptionTable.vue')

    expect(content).not.toContain('Priorité')
    expect(content).not.toContain('priorityLabel')
    expect(content).toContain('Destination')
  })

  it('désactive l’ancien encaissement manuel depuis la liste', () => {
    const page = source('src/modules/receptions/pages/ReceptionsListPage.vue')
    const table = source('src/modules/receptions/components/ReceptionTable.vue')

    expect(page).not.toContain('ReceptionPaymentDialog')
    expect(page).not.toContain('@pay=')
    expect(table).not.toContain('Encaisser')
    expect(table).not.toContain("emit('pay'")
  })

  it('présente le rôle administratif réel de la Réception', () => {
    const content = source('src/modules/receptions/pages/ReceptionsListPage.vue')

    expect(content).toContain(
      'Accueil administratif, vérification de la fiche patient, frais d’ouverture et transmission au triage.',
    )
  })

  it('conserve uniquement les filtres administratifs dans le store', () => {
    const content = source('src/modules/receptions/stores/receptions.store.js')
    const emptyFilters = content.match(
      /const EMPTY_FILTERS = Object\.freeze\(\{([\s\S]*?)\}\)/,
    )?.[1] || ''

    expect(emptyFilters).toContain("q: ''")
    expect(emptyFilters).toContain("payment: ''")
    expect(emptyFilters).toContain("status: ''")
    expect(emptyFilters).toContain("patientType: ''")
    expect(emptyFilters).not.toContain('priority')
    expect(emptyFilters).not.toContain('service')
  })
})
