import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canEditClinicalConsultation,
} from '@/modules/consultations/policies/consultation-clinical-ui.policy'

describe(
  'R4.4C — cohérence consultation/examens',
  () => {
    const auth = {
      roleCode: 'MEDECIN',
      user: {
        id: '7',
      },
      hasPermission: vi.fn(
        (permission) =>
          permission ===
          'consultation:update',
      ),
    }

    const base = {
      statut: 'EN_COURS',
      raw: {
        doctorUser: {
          id: '7',
        },
      },
    }

    it(
      'garde la saisie clinique active avant demande examen',
      () => {
        expect(
          canEditClinicalConsultation(
            auth,
            {
              ...base,
              episode_status:
                'EN_CONSULTATION',
            },
          ),
        ).toBe(true)
      },
    )

    it(
      'passe le formulaire clinique en lecture seule pendant attente résultats',
      () => {
        expect(
          canEditClinicalConsultation(
            auth,
            {
              ...base,
              episode_status:
                'EN_ATTENTE_RESULTATS',
            },
          ),
        ).toBe(false)
      },
    )
  },
)
