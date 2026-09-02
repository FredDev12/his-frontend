import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canReadClinicalHistory,
  clinicalHistoryActorLabel,
  clinicalHistoryPageLabel,
  clinicalHistoryRoleLabel,
  formatClinicalHistoryValue,
} from '@/modules/consultations/policies/consultation-clinical-history-ui.policy'

describe(
  'R4.3D-C — politique historique clinique',
  () => {
    it(
      'autorise admin et médecin avec consultation:read',
      () => {
        for (const roleCode of [
          'ADMIN',
          'MEDECIN',
        ]) {
          expect(
            canReadClinicalHistory({
              roleCode,
              hasPermission: vi.fn(
                () => true,
              ),
            }),
          ).toBe(true)
        }
      },
    )

    it(
      'refuse un rôle clinique non autorisé',
      () => {
        expect(
          canReadClinicalHistory({
            roleCode: 'INFIRMIER',
            hasPermission: vi.fn(
              () => true,
            ),
          }),
        ).toBe(false)
      },
    )

    it(
      'exige consultation:read',
      () => {
        expect(
          canReadClinicalHistory({
            roleCode: 'MEDECIN',
            hasPermission: vi.fn(
              () => false,
            ),
          }),
        ).toBe(false)
      },
    )

    it(
      'rend lisibles les valeurs vides',
      () => {
        expect(
          formatClinicalHistoryValue(null),
        ).toBe('Non renseigné')
        expect(
          formatClinicalHistoryValue('  '),
        ).toBe('Non renseigné')
      },
    )

    it(
      'conserve le texte clinique non vide',
      () => {
        expect(
          formatClinicalHistoryValue(
            'Examen normal',
          ),
        ).toBe('Examen normal')
      },
    )

    it(
      'formate acteur et rôle',
      () => {
        expect(
          clinicalHistoryActorLabel({
            actor: {
              name: 'Jean Médecin',
            },
          }),
        ).toBe('Jean Médecin')

        expect(
          clinicalHistoryRoleLabel(
            'MEDECIN',
          ),
        ).toBe('Médecin')
      },
    )

    it(
      'calcule le libellé de pagination',
      () => {
        expect(
          clinicalHistoryPageLabel(
            2,
            20,
            45,
          ),
        ).toBe('21–40 sur 45')
      },
    )
  },
)
