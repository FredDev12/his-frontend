import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canRequestConsultationExamen,
  createConfirmedExamenRequest,
  createExamenRequestDraft,
  examenRequestErrorMessage,
  examenTypeLabel,
  EXAMEN_TYPES,
} from '@/modules/consultations/policies/consultation-examen-request-ui.policy'

function auth(overrides = {}) {
  return {
    roleCode: 'MEDECIN',
    user: {
      id: '7',
    },
    hasPermission: vi.fn(
      (permission) =>
        permission === 'examen:create',
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

describe(
  'R4.4C — politique demande examen frontend',
  () => {
    it(
      'expose les six types officiels',
      () => {
        expect(
          EXAMEN_TYPES.map(
            (item) => item.value,
          ),
        ).toEqual([
          'LABORATOIRE',
          'RADIOLOGIE',
          'ECHOGRAPHIE',
          'SCANNER',
          'IRM',
          'AUTRE',
        ])
      },
    )

    it(
      'autorise le médecin affecté avec examen:create',
      () => {
        expect(
          canRequestConsultationExamen(
            auth(),
            consultation(),
          ),
        ).toBe(true)
      },
    )

    it(
      'autorise une demande additionnelle pendant attente résultats',
      () => {
        expect(
          canRequestConsultationExamen(
            auth(),
            consultation({
              episode_status:
                'EN_ATTENTE_RESULTATS',
            }),
          ),
        ).toBe(true)
      },
    )

    it(
      'refuse un autre médecin',
      () => {
        expect(
          canRequestConsultationExamen(
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
      'refuse un profil sans permission',
      () => {
        expect(
          canRequestConsultationExamen(
            auth({
              hasPermission: vi.fn(
                () => false,
              ),
            }),
            consultation(),
          ),
        ).toBe(false)
      },
    )

    it(
      'valide et normalise le brouillon',
      () => {
        expect(
          createExamenRequestDraft({
            type: 'LABORATOIRE',
            name: ' NFS ',
            clinicalIndication:
              ' Fièvre persistante ',
          }),
        ).toEqual({
          type: 'LABORATOIRE',
          name: 'NFS',
          clinicalIndication:
            'Fièvre persistante',
        })
      },
    )

    it(
      'ajoute la confirmation seulement après validation',
      () => {
        expect(
          createConfirmedExamenRequest({
            type: 'RADIOLOGIE',
            name: 'Thorax',
            clinicalIndication: '',
          }),
        ).toEqual({
          type: 'RADIOLOGIE',
          name: 'Thorax',
          clinicalIndication: null,
          confirmationAcknowledged: true,
        })
      },
    )

    it(
      'refuse un type ou nom invalide',
      () => {
        expect(() =>
          createExamenRequestDraft({
            type: 'INCONNU',
            name: 'X',
          }),
        ).toThrow()
      },
    )

    it(
      'traduit les erreurs métier',
      () => {
        expect(
          examenRequestErrorMessage({
            code:
              'EXAMEN_REQUEST_DOCTOR_SCOPE_DENIED',
          }),
        ).toContain(
          'médecin affecté',
        )

        expect(
          examenTypeLabel('ECHOGRAPHIE'),
        ).toBe('Échographie')
      },
    )
  },
)
