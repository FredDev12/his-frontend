import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  canStartConsultation,
  consultationStartErrorMessage,
  createConsultationStartPayload,
  normalizeStartedConsultation,
  shouldRefreshQueueAfterStartError,
} from '@/modules/consultations/policies/consultation-start-ui.policy'

describe(
  'R4.2B — politique frontend de prise en charge',
  () => {
    it(
      'autorise uniquement un médecin avec consultation:create',
      () => {
        const hasPermission = vi.fn(
          (permission) =>
            permission ===
            'consultation:create',
        )

        expect(
          canStartConsultation({
            roleCode: 'MEDECIN',
            hasPermission,
          }),
        ).toBe(true)

        expect(
          canStartConsultation({
            roleCode: 'ADMIN',
            hasPermission,
          }),
        ).toBe(false)

        expect(
          canStartConsultation({
            roleCode: 'MEDECIN',
            hasPermission: () => false,
          }),
        ).toBe(false)
      },
    )

    it(
      'construit le payload officiel avec confirmation explicite',
      () => {
        expect(
          createConsultationStartPayload(
            '11',
          ),
        ).toEqual({
          episodeId: '11',
          confirmationAcknowledged: true,
        })
      },
    )

    it(
      'refuse un identifiant épisode invalide',
      () => {
        expect(() =>
          createConsultationStartPayload(
            'EPI-11',
          ),
        ).toThrow(
          'L’épisode sélectionné est invalide.',
        )
      },
    )

    it(
      'normalise la consultation retournée par le backend',
      () => {
        const item = {
          id: '25',
          status: 'EN_COURS',
        }

        expect(
          normalizeStartedConsultation({
            item,
          }),
        ).toEqual(item)

        expect(
          normalizeStartedConsultation({
            data: {
              item,
            },
          }),
        ).toEqual(item)
      },
    )

    it(
      'traduit les conflits de prise en charge',
      () => {
        expect(
          consultationStartErrorMessage({
            code:
              'CONSULTATION_ALREADY_STARTED',
          }),
        ).toContain('déjà été commencée')

        expect(
          consultationStartErrorMessage({
            code:
              'CONSULTATION_SERVICE_SCOPE_DENIED',
          }),
        ).toContain('autre service')
      },
    )

    it(
      'demande une actualisation après un conflit métier',
      () => {
        expect(
          shouldRefreshQueueAfterStartError({
            code:
              'CONSULTATION_ALREADY_STARTED',
          }),
        ).toBe(true)

        expect(
          shouldRefreshQueueAfterStartError({
            code: 'NETWORK_OR_API_ERROR',
          }),
        ).toBe(false)
      },
    )
  },
)
