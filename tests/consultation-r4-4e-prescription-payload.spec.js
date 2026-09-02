import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  createConfirmedPrescription,
} from '@/modules/consultations/policies/consultation-prescription-ui.policy'

describe(
  'R4.4E — contrat payload prescription',
  () => {
    it(
      'n’envoie que notes lignes et confirmation',
      () => {
        const payload =
          createConfirmedPrescription({
            clinicalNotes:
              'Traitement de sortie',
            lines: [
              {
                medicationName:
                  'Amoxicilline',
                dosage: '500 mg',
                frequency:
                  '3 fois/jour',
                duration: '7 jours',
                quantity: 21,
                instructions:
                  'Après repas',
              },
            ],
          })

        expect(
          Object.keys(payload).sort(),
        ).toEqual([
          'clinicalNotes',
          'confirmationAcknowledged',
          'lines',
        ])

        expect(payload).not.toHaveProperty(
          'patientId',
        )
        expect(payload).not.toHaveProperty(
          'episodeId',
        )
        expect(payload).not.toHaveProperty(
          'consultationId',
        )
        expect(payload).not.toHaveProperty(
          'doctorUserId',
        )
        expect(payload).not.toHaveProperty(
          'serviceId',
        )
      },
    )
  },
)
