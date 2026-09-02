import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('Réception V1 — paiement en espèces uniquement', () => {
  it('construit les options depuis le paramètre backend', () => {
    const dialog = source(
      'src/modules/receptions/components/ReceptionFichePaymentDialog.vue',
    )

    expect(dialog).toContain('allowedPaymentModes.value.map')
    expect(dialog).toContain(':options="paymentModeOptions"')
  })

  it('affiche clairement le gel temporaire de Mobile Money', () => {
    const dialog = source(
      'src/modules/receptions/components/ReceptionFichePaymentDialog.vue',
    )

    expect(dialog).toContain('paiement en espèces uniquement')
    expect(dialog).toContain('Mobile Money sera activé ultérieurement')
  })

  it('refuse de considérer complet un mode désactivé par la configuration', () => {
    const page = source('src/modules/receptions/pages/ReceptionCreatePage.vue')

    expect(page).toContain('allowedFichePaymentModes')
    expect(page).toContain(
      'allowedFichePaymentModes.value.includes(fichePayment.value?.mode)',
    )
  })

  it('conserve les champs Mobile Money pour une activation future', () => {
    const dialog = source(
      'src/modules/receptions/components/ReceptionFichePaymentDialog.vue',
    )

    expect(dialog).toContain('v-if="isMobileMoney"')
    expect(dialog).toContain('mobileMoneyProvider')
    expect(dialog).toContain('payerPhone')
    expect(dialog).toContain('reference')
  })
})
