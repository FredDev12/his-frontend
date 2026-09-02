import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  createConfirmedExamenBatch,
  createEmptyExamenRequestItem,
  createExamenBatchDraft,
  examenBatchSummary,
  MAX_EXAMEN_BATCH_ITEMS,
} from '@/modules/consultations/policies/consultation-examen-request-ui.policy'

function item(overrides = {}) {
  return {
    type: 'LABORATOIRE',
    name: 'NFS',
    clinicalIndication:
      'Fièvre persistante',
    ...overrides,
  }
}

describe(
  'R4.4C2 — lot examens frontend',
  () => {
    it(
      'autorise un seul examen',
      () => {
        expect(
          createExamenBatchDraft({
            items: [item()],
          }).items,
        ).toHaveLength(1)
      },
    )

    it(
      'autorise plusieurs examens',
      () => {
        expect(
          createExamenBatchDraft({
            items: [
              item(),
              item({
                name: 'CRP',
              }),
              item({
                type: 'RADIOLOGIE',
                name:
                  'Radiographie thorax',
              }),
            ],
          }).items,
        ).toHaveLength(3)
      },
    )

    it(
      'refuse un lot vide',
      () => {
        expect(() =>
          createExamenBatchDraft({
            items: [],
          }),
        ).toThrow()
      },
    )

    it(
      'limite le lot à 20 examens',
      () => {
        expect(
          MAX_EXAMEN_BATCH_ITEMS,
        ).toBe(20)

        expect(() =>
          createExamenBatchDraft({
            items: Array.from(
              {
                length: 21,
              },
              () => item(),
            ),
          }),
        ).toThrow()
      },
    )

    it(
      'ajoute la confirmation uniquement à la dernière étape',
      () => {
        const confirmed =
          createConfirmedExamenBatch({
            items: [item()],
          })

        expect(
          confirmed.confirmationAcknowledged,
        ).toBe(true)
        expect(
          confirmed.items,
        ).toHaveLength(1)
      },
    )

    it(
      'crée une ligne vide réutilisable',
      () => {
        expect(
          createEmptyExamenRequestItem(),
        ).toEqual({
          type: '',
          name: '',
          clinicalIndication: '',
        })
      },
    )

    it(
      'produit un résumé numéroté',
      () => {
        const summary =
          examenBatchSummary({
            items: [
              item(),
              item({
                type: 'RADIOLOGIE',
                name:
                  'Radiographie thorax',
              }),
            ],
          })

        expect(summary).toContain(
          '1. Laboratoire — NFS',
        )
        expect(summary).toContain(
          '2. Radiologie — Radiographie thorax',
        )
      },
    )
  },
)
