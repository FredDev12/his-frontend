import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Réception — détail administratif sécurisé', () => {
  it('supprime les raccourcis cliniques du détail', () => {
    const content = source('src/modules/receptions/pages/ReceptionDetailsPage.vue')

    expect(content).not.toContain('Envoyer au triage')
    expect(content).not.toContain('Ouvrir consultation')
    expect(content).not.toContain('Motif de venue')
    expect(content).toContain('Transmis au triage')
  })

  it('affiche les preuves financières réelles', () => {
    const content = source('src/modules/receptions/pages/ReceptionDetailsPage.vue')

    expect(content).toContain('fichePayment?.facture?.factureNumber')
    expect(content).toContain('fichePayment?.paiement?.receiptNumber')
    expect(content).toContain('fichePayment?.paiement?.amount')
  })

  it('n’affiche plus de bouton de modification dans le détail', () => {
    const content = source('src/modules/receptions/pages/ReceptionDetailsPage.vue')

    expect(content).not.toContain('Modifier réception')
    expect(content).not.toContain('/edit')
  })

  it('neutralise l’ancien formulaire général de modification', () => {
    const content = source('src/modules/receptions/pages/ReceptionEditPage.vue')

    expect(content).toContain('Modification indisponible')
    expect(content).not.toContain('ReceptionForm')
    expect(content).not.toContain('updateReception')
  })

  it('retire la modification des actions de la liste', () => {
    const list = source('src/modules/receptions/pages/ReceptionsListPage.vue')
    const table = source('src/modules/receptions/components/ReceptionTable.vue')

    expect(list).not.toContain('@edit=')
    expect(list).not.toContain(':can-edit=')
    expect(table).not.toContain('Modifier')
    expect(table).not.toContain("emit('edit'")
  })

  it('retire l’appel PATCH inexistant du service frontend', () => {
    const content = source('src/modules/receptions/services/receptions.service.js')

    expect(content).not.toContain("api.patch(`/receptions/${id}`, payload)")
  })

  it('normalise le statut financier à partir de fichePayment', () => {
    const content = source('src/modules/receptions/stores/receptions.store.js')

    expect(content).toContain('reception.fichePayment?.status')
    expect(content).toContain("reception.fichePayment.status === 'PAID'")
    expect(content).toContain('receiptNumber')
  })

  it('ne déduit plus un paiement effectué à partir d’une valeur de remplacement', () => {
    const content = source('src/modules/receptions/components/ReceptionIdentityCard.vue')

    expect(content).not.toContain('dash(reception.paiement_effectue)')
    expect(content).toContain('paymentSummary')
  })
})
