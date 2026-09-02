import { describe, expect, it } from 'vitest'

import {
  ACTIVE_RECEPTION_BLOCK_REASON,
  activeReceptionDetailsPath,
  hasBlockingActiveReception,
} from '../src/modules/receptions/workflow/reception-active.workflow.js'

describe('Réception — blocage d’une réception déjà active', () => {
  const activeResult = {
    decision: 'EXISTING_PATIENT',
    canProceed: false,
    blockReason: ACTIVE_RECEPTION_BLOCK_REASON,
    activeReception: {
      id: '33',
      receptionCode: 'REC-2026-000033',
      status: 'ADMIS',
    },
  }

  it('bloque une fiche possédant une réception active', () => {
    expect(hasBlockingActiveReception(activeResult)).toBe(true)
  })

  it('construit le lien vers la réception en cours', () => {
    expect(activeReceptionDetailsPath(activeResult)).toBe('/receptions/33')
  })

  it('ne bloque pas un ancien épisode sans réception active', () => {
    expect(
      hasBlockingActiveReception({
        decision: 'EXISTING_PATIENT',
        canProceed: true,
        blockReason: null,
        activeEpisode: {
          id: '12',
          episodeCode: 'EPI-2026-000012',
          status: 'SORTI',
        },
        activeReception: null,
      }),
    ).toBe(false)
  })

  it('ne bloque pas une nouvelle fiche', () => {
    expect(
      hasBlockingActiveReception({
        decision: 'NEW_PATIENT',
        canProceed: true,
        blockReason: null,
        activeReception: null,
      }),
    ).toBe(false)
  })
})
