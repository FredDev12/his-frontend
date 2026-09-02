import { describe, expect, it } from 'vitest'

import {
  createEmptyTriageDashboard,
  formatTriageWaitingDuration,
  normalizeTriageDashboard,
  triageWaitingPresentation,
} from '../src/modules/triage/workflow/triage-dashboard.workflow.js'

describe('R3.4A — contrat du dashboard triage', () => {
  it('fournit un état vide stable', () => {
    const empty = createEmptyTriageDashboard()

    expect(empty.queue.total).toBe(0)
    expect(empty.today.totalTriages).toBe(0)
    expect(empty.priorityTriages).toEqual([])
  })

  it('normalise les indicateurs du backend', () => {
    const dashboard = normalizeTriageDashboard({
      queue: {
        total: 18,
        watchCount: 4,
        prolongedCount: 2,
        oldestWaitingMinutes: 91,
        items: [
          {
            patient: {
              id: '12',
              patientCode: 'PAT-2026-000012',
              firstName: 'Patrick',
              lastName: 'Tshibangu',
            },
            episode: {
              id: '13',
              episodeCode: 'EPI-2026-000013',
              createdAt: '2026-07-06T17:00:00.000Z',
            },
            reception: {
              id: '13',
              receptionCode: 'REC-2026-000013',
            },
            waitingSince: '2026-07-06T17:00:00.000Z',
            waitingMinutes: 91,
            waitingLevel: 'PROLONGED',
          },
        ],
      },
      today: {
        totalTriages: 13,
        priorities: {
          routine: 8,
          urgent: 3,
          veryUrgent: 1,
          vital: 1,
          priorityTotal: 5,
        },
        orientations: {
          immediateConsultations: 10,
          appointments: 3,
        },
      },
      reassessment: {
        awaitingConsultationTotal: 3,
        items: [
          {
            id: '9',
            priority: 'URGENT',
          },
        ],
      },
    })

    expect(dashboard.queue.total).toBe(18)
    expect(dashboard.queue.prolongedCount).toBe(2)
    expect(dashboard.queue.items[0].waitingMinutes).toBe(91)
    expect(dashboard.queue.items[0].waitingLevel).toBe('PROLONGED')
    expect(dashboard.today.priorities.priorityTotal).toBe(5)
    expect(
      dashboard.today.orientations.immediateConsultations,
    ).toBe(10)
    expect(
      dashboard.reassessment.awaitingConsultationTotal,
    ).toBe(3)
    expect(dashboard.reassessment.items).toHaveLength(1)
  })

  it('formate les attentes inférieures à une heure', () => {
    expect(formatTriageWaitingDuration(29)).toBe('29 min')
  })

  it('formate les attentes de plusieurs heures', () => {
    expect(formatTriageWaitingDuration(125)).toBe('2 h 5 min')
  })

  it('convertit les longues attentes en jours lisibles', () => {
    expect(formatTriageWaitingDuration(35_521)).toBe(
      '24 j 16 h 1 min',
    )
    expect(formatTriageWaitingDuration(1_440)).toBe('1 j')
  })

  it('présente séparément surveillance et attente prolongée', () => {
    expect(triageWaitingPresentation('WATCH')).toEqual({
      label: 'À surveiller',
      variant: 'warning',
    })

    expect(triageWaitingPresentation('PROLONGED')).toEqual({
      label: 'Attente prolongée',
      variant: 'danger',
    })
  })

  it('ne transforme pas un délai en urgence clinique', () => {
    expect(triageWaitingPresentation('PROLONGED').label).not.toContain(
      'Urgence',
    )
  })
})
