import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canCreateConsultationPrescription,
  createConfirmedPrescription,
  createEmptyPrescriptionLine,
  createPrescriptionDraft,
  prescriptionErrorMessage,
  prescriptionSummary,
} from '@/modules/consultations/policies/consultation-prescription-ui.policy'

function auth(overrides = {}) {
  return {
    roleCode: 'MEDECIN',
    user: {
      id: '7',
    },
    hasPermission: vi.fn(
      (permission) =>
        permission ===
        'prescription:create',
    ),
    ...overrides,
  }
}

function consultation(overrides = {}) {
  return {
    statut: 'EN_COURS',
    episode_status: 'EN_CONSULTATION',
    raw: {
      doctorUser: {
        id: '7',
      },
    },
    ...overrides,
  }
}

function validForm() {
  return {
    clinicalNotes: 'Traitement symptomatique',
    lines: [
      {
        medicationName: 'Paracétamol',
        dosage: '500 mg',
        frequency: '3 fois/jour',
        duration: '3 jours',
        quantity: '9',
        instructions: 'Après repas',
      },
    ],
  }
}

describe(
  'R4.4E — politique prescription frontend',
  () => {
    it(
      'autorise le médecin affecté avec prescription:create',
      () => {
        expect(
          canCreateConsultationPrescription(
            auth(),
            consultation(),
          ),
        ).toBe(true)
      },
    )

    it(
      'refuse un autre médecin',
      () => {
        expect(
          canCreateConsultationPrescription(
            auth({
              user: {
                id: '8',
              },
            }),
            consultation(),
          ),
        ).toBe(false)
      },
    )

    it(
      'refuse une consultation non active',
      () => {
        expect(
          canCreateConsultationPrescription(
            auth(),
            consultation({
              statut: 'CLOTUREE',
            }),
          ),
        ).toBe(false)
      },
    )

    it(
      'refuse EN_ATTENTE_RESULTATS',
      () => {
        expect(
          canCreateConsultationPrescription(
            auth(),
            consultation({
              episode_status:
                'EN_ATTENTE_RESULTATS',
            }),
          ),
        ).toBe(false)
      },
    )

    it(
      'refuse EN_PHARMACIE',
      () => {
        expect(
          canCreateConsultationPrescription(
            auth(),
            consultation({
              episode_status:
                'EN_PHARMACIE',
            }),
          ),
        ).toBe(false)
      },
    )

    it(
      'normalise une prescription valide',
      () => {
        expect(
          createPrescriptionDraft(
            validForm(),
          ),
        ).toEqual({
          clinicalNotes:
            'Traitement symptomatique',
          lines: [
            {
              medicationName:
                'Paracétamol',
              dosage: '500 mg',
              frequency:
                '3 fois/jour',
              duration: '3 jours',
              quantity: 9,
              instructions:
                'Après repas',
            },
          ],
        })
      },
    )

    it(
      'ajoute confirmationAcknowledged uniquement à la confirmation',
      () => {
        expect(
          createConfirmedPrescription(
            validForm(),
          ).confirmationAcknowledged,
        ).toBe(true)
      },
    )

    it(
      'refuse une prescription sans ligne',
      () => {
        expect(() =>
          createPrescriptionDraft({
            lines: [],
          }),
        ).toThrow()
      },
    )

    it(
      'refuse une quantité non entière',
      () => {
        const form = validForm()
        form.lines[0].quantity = '1.5'

        expect(() =>
          createPrescriptionDraft(form),
        ).toThrow()
      },
    )

    it(
      'crée une ligne vide réutilisable',
      () => {
        expect(
          createEmptyPrescriptionLine(),
        ).toEqual({
          medicationName: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: '',
          instructions: '',
        })
      },
    )

    it(
      'produit un résumé explicite',
      () => {
        expect(
          prescriptionSummary(
            createPrescriptionDraft(
              validForm(),
            ),
          ),
        ).toContain(
          'Paracétamol — 500 mg',
        )
      },
    )

    it(
      'traduit les erreurs métier principales',
      () => {
        expect(
          prescriptionErrorMessage({
            code:
              'PRESCRIPTION_EPISODE_NOT_READY',
          }),
        ).toContain(
          'revenu en consultation',
        )
      },
    )
  },
)
