import { describe, expect, it } from 'vitest'

import {
  buildReceptionCreatePayload,
  buildReceptionIdentityFingerprint,
  buildReceptionIdentityPreflightPayload,
  buildReceptionPatientSelectionPayload,
  buildReceptionFichePaymentPayload,
  isReceptionFichePaymentComplete,
  resolveReceptionFicheOpeningAmount,
} from '../src/modules/receptions/workflow/reception-create.workflow.js'

function publicForm() {
  return {
    patientType: 'PUBLIC',
    agentReference: '',
    relationToAgent: '',
    patient: {
      firstName: 'Serge',
      lastName: 'Kasongo',
      middleName: 'Kabeya',
      gender: 'M',
      birthDate: '1988-07-12',
      estimatedAge: '38',
      phone: '0990000000',
      address: 'Lubumbashi',
      emergencyContactName: 'Anne',
      emergencyContactPhone: '0970000000',
    },
  }
}

describe('Réception — workflow de prévalidation frontend', () => {
  it('prévalide une identité sans réutiliser un patientId implicite', () => {
    const form = publicForm()
    form.patient.id = '42'

    const payload = buildReceptionIdentityPreflightPayload(form)

    expect(payload.patientId).toBeUndefined()
    expect(payload.patient.firstName).toBe('Serge')
    expect(payload.patientType).toBe('PUBLIC')
  })

  it('confirme explicitement une fiche choisie par patientId', () => {
    const payload = buildReceptionPatientSelectionPayload(publicForm(), 42)

    expect(payload.patientId).toBe('42')
    expect(payload.patient).toBeUndefined()
  })

  it('crée une visite sur une fiche existante sans renvoyer la fiche complète', () => {
    const payload = buildReceptionCreatePayload(publicForm(), {
      decision: 'EXISTING_PATIENT',
      patient: { id: '42' },
    })

    expect(payload.patientId).toBe('42')
    expect(payload.patient).toBeUndefined()
    expect(payload.duplicateResolution).toBeUndefined()
    expect(payload.fichePaymentRequired).toBeUndefined()
  })

  it('transmet l’identité uniquement pour une nouvelle fiche sans correspondance', () => {
    const payload = buildReceptionCreatePayload(publicForm(), {
      decision: 'NEW_PATIENT',
      patient: null,
    })

    expect(payload.patientId).toBeUndefined()
    expect(payload.patient.lastName).toBe('Kasongo')
    expect(payload.orientation.targetModule).toBe('TRIAGE')
    expect(payload.duplicateResolution).toBeUndefined()
  })

  it('transmet la confirmation auditée lorsque les fiches proposées sont rejetées', () => {
    const payload = buildReceptionCreatePayload(
      publicForm(),
      {
        decision: 'POSSIBLE_DUPLICATES',
        matches: [{ id: '24' }, { id: '29' }],
      },
      {
        action: 'CREATE_NEW',
        candidateIds: ['24', '29', '29'],
      },
    )

    expect(payload.patientId).toBeUndefined()
    expect(payload.patient.lastName).toBe('Kasongo')
    expect(payload.duplicateResolution).toEqual({
      action: 'CREATE_NEW',
      confirmation: 'AUCUNE_CORRESPONDANCE',
      candidateIds: ['24', '29'],
    })
  })

  it('n’envoie pas de confirmation si aucune dérogation n’est validée', () => {
    const payload = buildReceptionCreatePayload(publicForm(), {
      decision: 'POSSIBLE_DUPLICATES',
      matches: [{ id: '24' }],
    })

    expect(payload.duplicateResolution).toBeUndefined()
  })

  it('invalide la prévalidation lorsque l’un des cinq critères d’identité change', () => {
    const fields = ['firstName', 'lastName', 'middleName', 'gender', 'birthDate']

    for (const field of fields) {
      const form = publicForm()
      const before = buildReceptionIdentityFingerprint(form)
      form.patient[field] = `${form.patient[field]}-modifie`

      expect(buildReceptionIdentityFingerprint(form)).not.toBe(before)
    }
  })

  it('ne change pas la décision métier lorsque seul le téléphone change', () => {
    const form = publicForm()
    const before = buildReceptionIdentityFingerprint(form)

    form.patient.phone = '0971111111'

    // Le frontend relance encore la prévalidation pour actualiser les données,
    // mais le backend n’utilise jamais le téléphone pour décider d’une correspondance.
    expect(buildReceptionIdentityFingerprint(form)).not.toBe(before)
  })
})


describe('Réception — paiement des frais d’ouverture frontend', () => {
  const setting = {
    value: {
      defaultCurrency: 'CDF',
      amounts: { CDF: 22000, USD: 10 },
    },
  }

  it('accepte un paiement en espèces sans montant libre', () => {
    const payment = { currency: 'CDF', mode: 'CASH' }

    expect(isReceptionFichePaymentComplete(payment)).toBe(true)
    expect(buildReceptionFichePaymentPayload(payment)).toEqual({
      currency: 'CDF',
      mode: 'CASH',
    })
    expect(buildReceptionFichePaymentPayload(payment).amount).toBeUndefined()
  })

  it('exige la traçabilité complète pour Mobile Money', () => {
    expect(
      isReceptionFichePaymentComplete({
        currency: 'CDF',
        mode: 'MOBILE_MONEY',
        mobileMoneyProvider: 'Airtel Money',
      }),
    ).toBe(false)

    const payment = {
      currency: 'CDF',
      mode: 'MOBILE_MONEY',
      mobileMoneyProvider: 'Airtel Money',
      payerPhone: '0990000000',
      reference: 'MM-20260724-001',
    }

    expect(isReceptionFichePaymentComplete(payment)).toBe(true)
    expect(buildReceptionFichePaymentPayload(payment)).toEqual(payment)
  })

  it('ajoute le paiement uniquement à la création d’une nouvelle fiche', () => {
    const payment = { currency: 'USD', mode: 'CASH' }
    const payload = buildReceptionCreatePayload(
      publicForm(),
      { decision: 'NEW_PATIENT', patient: null },
      null,
      payment,
    )

    expect(payload.fichePayment).toEqual(payment)
    expect(payload.fichePayment.amount).toBeUndefined()
  })

  it('n’envoie jamais de paiement pour une fiche existante', () => {
    const payload = buildReceptionCreatePayload(
      publicForm(),
      { decision: 'EXISTING_PATIENT', patient: { id: '42' } },
      null,
      { currency: 'CDF', mode: 'CASH' },
    )

    expect(payload.patientId).toBe('42')
    expect(payload.fichePayment).toBeUndefined()
  })

  it('lit le tarif depuis le paramètre backend', () => {
    expect(resolveReceptionFicheOpeningAmount(setting, 'CDF')).toBe(22000)
    expect(resolveReceptionFicheOpeningAmount(setting, 'USD')).toBe(10)
    expect(resolveReceptionFicheOpeningAmount(setting, 'EUR')).toBeNull()
  })
})
