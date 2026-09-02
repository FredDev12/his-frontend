import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  buildTriageCreatePayload,
  normalizeTriageServices,
} from '../src/modules/triage/workflow/triage-create.workflow.js'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('R3.3 — services cliniques et choix explicites', () => {
  it('masque en défense les services non admissibles', () => {
    const services = normalizeTriageServices({
      items: [
        { id: '1', name: 'Administration', active: true, canReceiveTriage: false },
        { id: '2', name: 'Médecine générale', active: true, canReceiveTriage: true },
      ],
    })

    expect(services).toHaveLength(1)
    expect(services[0].name).toBe('Médecine générale')
  })

  it('ne choisit aucune destination par défaut dans le payload', () => {
    const payload = buildTriageCreatePayload(
      {
        motifInitial: '',
        typePassage: '',
        priority: '',
        temperatureCelsius: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        requestedServiceId: '',
        orientationTargetModule: '',
      },
      { episode: { id: '12' } },
    )

    expect(payload.typePassage).toBe('')
    expect(payload.priority).toBe('')
    expect(payload.orientation.targetModule).toBe('')
  })

  it('initialise les trois choix cliniques à vide', () => {
    const form = source('src/modules/triage/components/TriageForm.vue')

    expect(form).toContain("typePassage: ''")
    expect(form).toContain("priority: ''")
    expect(form).toContain("orientationTargetModule: ''")
  })

  it('affiche des libellés explicatifs pour les initiés et non-initiés', () => {
    const workflow = source(
      'src/modules/triage/workflow/triage-create.workflow.js',
    )

    expect(workflow).toContain('Consultation sans rendez-vous')
    expect(workflow).toContain('peut attendre en sécurité')
    expect(workflow).toContain('prise en charge immédiate')
  })

  it('regroupe les mesures complémentaires', () => {
    const form = source('src/modules/triage/components/TriageForm.vue')

    expect(form).toContain('<details')
    expect(form).toContain('Mesures complémentaires')
    expect(form).toContain('Pourcentage d’oxygène mesuré avec l’oxymètre')
  })

  it('bloque le formulaire lorsque aucun service clinique n’est disponible', () => {
    const form = source('src/modules/triage/components/TriageForm.vue')

    expect(form).toContain('Aucun service clinique n’est actuellement autorisé')
    expect(form).toContain('services.length === 0 ||')
    expect(form).toContain(
      '(vitalEmergency && !vitalEmergencyConfigured)',
    )
  })
});
