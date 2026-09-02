import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  normalizeAgent,
  normalizeListResponse,
} from '../src/modules/agents/stores/agents.store'

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

const externalAgent = {
  cac_id_co: 'CAC-AG-002',
  nom_post: 'KALALA ILUNGA',
  prenom: 'Joseph',
  sexe: 'M',
  grand: '',
  fonction: 'Technicien',
  nationalite: 'Congolaise',
  site: 'Site Mine',
  adresse: 'Kambove',
  statut_marital: 'Marié',
  nom_conjoint: 'KALALA KASONGO Mireille',
  nbre_enfa: '3',
  nom_enfant: 'Junior, Grâce, Prince',
  telephone: '0990000002',
  date_de_naissance: '1986-07-20',
  parents: '',
  statutparents: '',
}

describe('Agents CAC — contrat externe frontend', () => {
  it('normalise le schéma plat documenté sans identity/family', () => {
    const normalized = normalizeAgent(externalAgent)

    expect(normalized.cac_id_co).toBe('CAC-AG-002')
    expect(normalized.nom_post).toBe('KALALA ILUNGA')
    expect(normalized.prenom).toBe('Joseph')
    expect(normalized.raw).toEqual(externalAgent)
    expect(normalized.raw).not.toHaveProperty('identity')
    expect(normalized.raw).not.toHaveProperty('family')
  })

  it('respecte la pagination data/page/limit/total/hasNext/hasPrev', () => {
    const normalized = normalizeListResponse({
      data: [externalAgent],
      page: 2,
      limit: 10,
      total: 25,
      hasNext: true,
      hasPrev: true,
    })

    expect(normalized.items).toHaveLength(1)
    expect(normalized).toMatchObject({
      page: 2,
      limite: 10,
      total: 25,
      hasNext: true,
      hasPrev: true,
    })
  })

  it('implémente les routes documentées dans le service frontend', () => {
    const content = source('src/modules/agents/services/agents.service.js')

    expect(content).toContain("api.get('/agents'")
    expect(content).toContain("api.get('/agents/search'")
    expect(content).toContain("api.get('/agents/statistiques'")
    expect(content).toContain('`/agents/cac/${encodeURIComponent(cacId)}`')
    expect(content).toContain('`/agents/site/${encodeURIComponent(siteName)}`')
    expect(content).toContain('`/agents/function/${encodeURIComponent(fonction)}`')
  })

  it('utilise les cinq critères exacts de recherche', () => {
    const content = source('src/modules/agents/services/agents.service.js')

    for (const key of ['cac_id_co', 'nom_post', 'prenom', 'site', 'telephone']) {
      expect(content).toContain(`${key}: filters.${key}`)
    }
    expect(content).not.toContain('params: { q }')
  })

  it('active uniquement le conjoint déclaré sans reconstruire les enfants', () => {
    const searchCard = source('src/modules/agents/components/AgentSearchCard.vue')
    const medicalFiles = source('src/modules/agents/services/agent-medical-file.service.js')

    expect(searchCard).toContain('La V1 prend en charge uniquement le conjoint')
    expect(searchCard).toContain('agent.nom_conjoint')
    expect(searchCard).toContain("relationship: 'SPOUSE'")
    expect(searchCard).toContain('Un justificatif de rattachement est obligatoire')
    expect(medicalFiles).toContain('return [buildAgentBeneficiary(agent)]')
    expect(medicalFiles).not.toContain('buildChildBeneficiaries')
  })

  it('envoie cac_id_co comme référence d’agent à la Réception', () => {
    const content = source('src/modules/receptions/pages/ReceptionCreatePage.vue')
    expect(content).toContain('payload.agent?.cac_id_co || payload.agent?.matricule')
    expect(content).toContain("form.patient.gender = payload.patient?.gender || ''")
  })
})
