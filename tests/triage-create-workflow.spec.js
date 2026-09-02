import { describe, expect, it } from 'vitest'

import {
  buildTriageCreatePayload,
  normalizeTriageQueueResponse,
  normalizeTriageServices,
  triagePatientFullName,
} from '../src/modules/triage/workflow/triage-create.workflow.js'

const queueItem = {
  patient: {
    id: '12',
    patientCode: 'PAT-2026-000012',
    firstName: 'Aline',
    lastName: 'Kabamba',
    middleName: 'Mutombo',
  },
  episode: {
    id: '45',
    episodeCode: 'EPI-2026-000045',
  },
  reception: {
    id: '45',
    receptionCode: 'REC-2026-000045',
  },
}

function form(overrides = {}) {
  return {
    motifInitial: 'Douleur abdominale aiguë',
    typePassage: 'CONSULTATION',
    priority: 'URGENT',
    temperatureCelsius: '38.4',
    bloodPressureSystolic: '120',
    bloodPressureDiastolic: '80',
    heartRate: '96',
    respiratoryRate: '22',
    oxygenSaturation: '97',
    weightKg: '',
    heightCm: '',
    glucoseMgDl: '',
    painScore: '7',
    firstAidPerformed: false,
    firstAidNotes: '',
    requestedServiceId: '4',
    orientationTargetModule: 'CONSULTATION',
    appointmentDateTime: '',
    ...overrides,
  }
}

describe('R3.2 — contrat frontend de création du triage', () => {
  it('normalise la file officielle du backend', () => {
    const result = normalizeTriageQueueResponse({
      items: [queueItem],
      count: 21,
      page: 2,
      limit: 10,
    })

    expect(result.items).toHaveLength(1)
    expect(result.count).toBe(21)
    expect(result.hasNext).toBe(true)
    expect(result.hasPrev).toBe(true)
  })

  it('construit le nom complet sans modifier l’identité', () => {
    expect(triagePatientFullName(queueItem)).toBe(
      'Kabamba Mutombo Aline',
    )
  })

  it('construit exactement le payload attendu par le backend', () => {
    expect(buildTriageCreatePayload(form(), queueItem)).toEqual({
      episodeId: '45',
      motifInitial: 'Douleur abdominale aiguë',
      typePassage: 'CONSULTATION',
      priority: 'URGENT',
      requestedServiceId: '4',
      vitals: {
        temperatureCelsius: 38.4,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 96,
        respiratoryRate: 22,
        oxygenSaturation: 97,
        weightKg: null,
        heightCm: null,
        glucoseMgDl: null,
        painScore: 7,
      },
      firstAid: {
        performed: false,
        notes: null,
      },
      orientation: {
        targetModule: 'CONSULTATION',
        targetServiceId: '4',
        doctorId: null,
        appointmentRequired: false,
        appointmentDateTime: null,
      },
    })
  })

  it('documente les premiers soins lorsqu’ils sont réalisés', () => {
    const payload = buildTriageCreatePayload(
      form({
        firstAidPerformed: true,
        firstAidNotes: 'Oxygène administré',
      }),
      queueItem,
    )

    expect(payload.firstAid).toEqual({
      performed: true,
      notes: 'Oxygène administré',
    })
  })

  it('transforme un rendez-vous en date ISO et aligne le service cible', () => {
    const payload = buildTriageCreatePayload(
      form({
        orientationTargetModule: 'RDV_CONSULTATION',
        appointmentDateTime: '2026-08-03T09:30',
      }),
      queueItem,
    )

    expect(payload.orientation.targetModule).toBe('RDV_CONSULTATION')
    expect(payload.orientation.targetServiceId).toBe('4')
    expect(payload.orientation.appointmentRequired).toBe(true)
    expect(payload.orientation.appointmentDateTime).toContain(
      '2026-08-03T',
    )
  })

  it('normalise les services actifs avec leur site', () => {
    const services = normalizeTriageServices({
      items: [
        {
          id: '4',
          code: 'MED',
          name: 'Médecine interne',
          active: true,
          canReceiveTriage: true,
          site: {
            id: '1',
            name: 'Bâtiment principal',
          },
        },
      ],
    })

    expect(services[0]).toMatchObject({
      value: '4',
      label: 'Médecine interne — Bâtiment principal',
    })
  })
})
