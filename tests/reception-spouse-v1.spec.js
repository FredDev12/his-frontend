import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildReceptionCreatePayload,
  buildReceptionIdentityFingerprint,
  buildReceptionIdentityPreflightPayload,
  buildReceptionPatientSelectionPayload,
} from '../src/modules/receptions/workflow/reception-create.workflow.js'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function spouseForm() {
  return {
    patientType: 'AYANT_DROIT',
    isAgent: false,
    agentReference: 'CAC-AG-002',
    relationToAgent: 'SPOUSE',
    spouseVerification: {
      documentType: 'MARRIAGE_CERTIFICATE',
      documentReference: 'ACTE-MAR-2026-001',
    },
    patient: {
      firstName: 'Mireille',
      lastName: 'Kalala',
      middleName: 'Kasongo',
      gender: 'F',
      birthDate: '1990-01-10',
      estimatedAge: '36',
      phone: '0991111111',
      address: 'Lubumbashi',
      emergencyContactName: 'Joseph Kalala',
      emergencyContactPhone: '0990000002',
    },
  }
}

describe('Réception — conjoint(e) CAC V1 frontend', () => {
  it('envoie SPOUSE et le justificatif pendant le préflight', () => {
    const payload = buildReceptionIdentityPreflightPayload(spouseForm())

    expect(payload).toMatchObject({
      patientType: 'AYANT_DROIT',
      isAgent: false,
      agentReference: 'CAC-AG-002',
      relationToAgent: 'SPOUSE',
      spouseVerification: {
        documentType: 'MARRIAGE_CERTIFICATE',
        documentReference: 'ACTE-MAR-2026-001',
      },
    })
  })

  it('conserve le justificatif lors de la sélection d’une fiche existante', () => {
    const payload = buildReceptionPatientSelectionPayload(spouseForm(), 42)

    expect(payload.patientId).toBe('42')
    expect(payload.spouseVerification.documentReference).toBe(
      'ACTE-MAR-2026-001',
    )
  })

  it('conserve le justificatif lors de la création d’une nouvelle fiche', () => {
    const payload = buildReceptionCreatePayload(spouseForm(), {
      decision: 'NEW_PATIENT',
      patient: null,
    })

    expect(payload.patient.firstName).toBe('Mireille')
    expect(payload.relationToAgent).toBe('SPOUSE')
    expect(payload.spouseVerification.documentType).toBe(
      'MARRIAGE_CERTIFICATE',
    )
    expect(payload.fichePayment).toBeUndefined()
  })

  it('invalide le préflight lorsque le justificatif change', () => {
    const form = spouseForm()
    const before = buildReceptionIdentityFingerprint(form)

    form.spouseVerification.documentReference = 'ACTE-MAR-2026-002'

    expect(buildReceptionIdentityFingerprint(form)).not.toBe(before)
  })

  it('affiche le conjoint déclaré et interdit les agents sans conjoint', () => {
    const card = source('src/modules/agents/components/AgentSearchCard.vue')

    expect(card).toContain('Conjoint(e) déclaré(e)')
    expect(card).toContain('canSelectAgent(agent)')
    expect(card).toContain('Aucun conjoint déclaré — sélection indisponible')
    expect(card).toContain("defineEmits(['selected', 'cleared'])")
  })

  it('ne propose ni enfant ni parent dans la V1', () => {
    const page = source(
      'src/modules/receptions/pages/ReceptionCreatePage.vue',
    )
    const card = source('src/modules/agents/components/AgentSearchCard.vue')

    expect(page).toContain('Conjoint(e) uniquement pour la V1')
    expect(card).toContain('Les enfants et les parents seront ajoutés')
    expect(card).not.toContain("relationship: 'CHILD'")
    expect(card).not.toContain("relationship: 'PARENT'")
  })

  it('laisse téléphone et adresse modifiables pour une nouvelle fiche', () => {
    const page = source(
      'src/modules/receptions/pages/ReceptionCreatePage.vue',
    )

    expect(page).toContain(
      'v-model="form.patient.phone" :readonly="administrativeDetailsReadonly"',
    )
    expect(page).toContain(
      'v-model="form.patient.address" :readonly="administrativeDetailsReadonly"',
    )
  })

  it('verrouille uniquement l’identité de l’agent lui-même', () => {
    const page = source(
      'src/modules/receptions/pages/ReceptionCreatePage.vue',
    )

    expect(page).toContain(
      "form.patientType === 'AGENT_CAC' && agentVerified.value",
    )
    expect(page).toContain(
      "if (isSpouseFlow.value && !form.patient.birthDate) return false",
    )
  })
})
