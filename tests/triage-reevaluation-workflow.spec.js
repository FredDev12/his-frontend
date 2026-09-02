import { describe, expect, it } from 'vitest'

import {
  buildTriageReevaluationPayload,
  normalizeTriageReevaluation,
  reevaluationPriorityOptions,
} from '../src/modules/triage/workflow/triage-reevaluation.workflow.js'

describe('R3.4B — réévaluation clinique frontend', () => {
  it('ne propose jamais une priorité inférieure', () => {
    expect(
      reevaluationPriorityOptions('TRES_URGENT').map(
        (item) => item.value,
      ),
    ).toEqual(['TRES_URGENT', 'VITALE'])
  })

  it('construit le payload clinique attendu', () => {
    const payload = buildTriageReevaluationPayload({
      newPriority: 'URGENT',
      temperatureCelsius: '38.2',
      bloodPressureSystolic: '120',
      bloodPressureDiastolic: '80',
      heartRate: '92',
      respiratoryRate: '20',
      oxygenSaturation: '97',
      weightKg: '',
      heightCm: '',
      glucoseMgDl: '',
      painScore: '5',
      clinicalNotes: 'Douleur plus intense depuis dix minutes.',
      vitalEmergencyConfirmed: false,
    })

    expect(payload).toMatchObject({
      newPriority: 'URGENT',
      clinicalNotes:
        'Douleur plus intense depuis dix minutes.',
      vitalEmergencyConfirmed: false,
      vitals: {
        temperatureCelsius: 38.2,
        heartRate: 92,
        oxygenSaturation: 97,
        painScore: 5,
      },
    })
  })

  it('normalise l’historique de réévaluation', () => {
    const item = normalizeTriageReevaluation({
      id: '4',
      sequenceNumber: 2,
      previousPriority: 'URGENT',
      newPriority: 'VITALE',
      emergencyEscalated: true,
      vitals: {
        temperatureCelsius: 39,
        heartRate: 130,
        respiratoryRate: 30,
        oxygenSaturation: 86,
      },
    })

    expect(item.id).toBe('4')
    expect(item.sequenceNumber).toBe(2)
    expect(item.emergencyEscalated).toBe(true)
    expect(item.oxygenSaturation).toBe(86)
  })
})
