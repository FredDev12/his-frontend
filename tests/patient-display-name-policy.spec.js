import { describe, expect, it } from 'vitest'

import {
  patientDisplayName,
  patientFullName,
} from '../src/shared/utils/patient.js'

describe('Affichage cohérent de l’identité patient', () => {
  it('conserve l’ordre Nom Postnom Prénom', () => {
    expect(
      patientFullName({
        nom: 'KABAMBA',
        postnom: 'ILUNGA',
        prenom: 'Alain',
      }),
    ).toBe('KABAMBA ILUNGA Alain')
  })

  it('accepte également le contrat backend brut', () => {
    expect(
      patientFullName({
        patient: {
          lastName: 'TSHIBANGU',
          middleName: 'KASONGO',
          firstName: 'Patrick',
        },
      }),
    ).toBe('TSHIBANGU KASONGO Patrick')
  })

  it('utilise le code patient si l’identité est absente', () => {
    expect(
      patientDisplayName({}, 'PAT-2026-000051'),
    ).toBe('Patient PAT-2026-000051')
  })

  it('n’altère jamais une identité réellement enregistrée', () => {
    expect(
      patientDisplayName({
        nom: 'E2Eecb345ea641f47668317ea70',
        prenom: 'E2E',
      }),
    ).toBe('E2Eecb345ea641f47668317ea70 E2E')
  })
})
