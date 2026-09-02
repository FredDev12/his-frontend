import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canEditClinicalConsultation,
  clinicalFormFromConsultation,
  clinicalFormSnapshot,
  clinicalUpdateErrorMessage,
  createClinicalUpdatePayload,
  hasClinicalChanges,
  isClinicalVersionConflict,
} from '@/modules/consultations/policies/consultation-clinical-ui.policy'

describe(
  'R4.3C — politique frontend clinique',
  () => {
    it(
      'hydrate les cinq champs cliniques autorisés',
      () => {
        expect(
          clinicalFormFromConsultation({
            histoire: 'Histoire',
            antecedents: 'HTA',
            examen_clinique: 'Examen',
            diagnostique: 'Diagnostic',
            plan_prise_en_charge: 'Plan',
          }),
        ).toEqual({
          illnessHistory: 'Histoire',
          medicalHistory: 'HTA',
          clinicalExam: 'Examen',
          provisionalDiagnosis: 'Diagnostic',
          treatmentPlan: 'Plan',
        })
      },
    )

    it(
      'normalise les champs vides en null',
      () => {
        expect(
          clinicalFormSnapshot({
            illnessHistory: '  ',
            medicalHistory: '',
            clinicalExam: ' Normal ',
            provisionalDiagnosis: '',
            treatmentPlan: '',
          }),
        ).toEqual({
          illnessHistory: null,
          medicalHistory: null,
          clinicalExam: 'Normal',
          provisionalDiagnosis: null,
          treatmentPlan: null,
        })
      },
    )

    it(
      'détecte une modification réelle',
      () => {
        const initial = {
          illnessHistory: 'Avant',
          medicalHistory: null,
          clinicalExam: null,
          provisionalDiagnosis: null,
          treatmentPlan: null,
        }

        expect(
          hasClinicalChanges(
            {
              illnessHistory: 'Après',
            },
            initial,
          ),
        ).toBe(true)
      },
    )

    it(
      'construit un PATCH partiel avec expectedUpdatedAt',
      () => {
        expect(
          createClinicalUpdatePayload(
            {
              illnessHistory: 'Après',
              medicalHistory: '',
              clinicalExam: '',
              provisionalDiagnosis: '',
              treatmentPlan: '',
            },
            '2026-08-10T11:00:00.000Z',
            {
              illnessHistory: 'Avant',
              medicalHistory: null,
              clinicalExam: null,
              provisionalDiagnosis: null,
              treatmentPlan: null,
            },
          ),
        ).toEqual({
          expectedUpdatedAt:
            '2026-08-10T11:00:00.000Z',
          illnessHistory: 'Après',
        })
      },
    )

    it(
      'refuse une sauvegarde sans version',
      () => {
        expect(() =>
          createClinicalUpdatePayload(
            { illnessHistory: 'Texte' },
            '',
            {
              illnessHistory: null,
              medicalHistory: null,
              clinicalExam: null,
              provisionalDiagnosis: null,
              treatmentPlan: null,
            },
          ),
        ).toThrow(/Version du dossier clinique absente/)
      },
    )

    it(
      'autorise uniquement le médecin affecté avec consultation:update',
      () => {
        const auth = {
          roleCode: 'MEDECIN',
          user: { id: '7' },
          hasPermission: vi.fn(
            (permission) =>
              permission ===
              'consultation:update',
          ),
        }

        const consultation = {
          statut: 'EN_COURS',
          episode_status: 'EN_CONSULTATION',
          raw: {
            doctorUser: {
              id: '7',
            },
          },
        }

        expect(
          canEditClinicalConsultation(
            auth,
            consultation,
          ),
        ).toBe(true)

        expect(
          canEditClinicalConsultation(
            {
              ...auth,
              user: { id: '8' },
            },
            consultation,
          ),
        ).toBe(false)
      },
    )

    it(
      'identifie le conflit de version et son message',
      () => {
        const error = {
          code:
            'CONSULTATION_CLINICAL_VERSION_CONFLICT',
        }

        expect(
          isClinicalVersionConflict(error),
        ).toBe(true)

        expect(
          clinicalUpdateErrorMessage(error),
        ).toContain(
          'modifié depuis son chargement',
        )
      },
    )
  },
)
