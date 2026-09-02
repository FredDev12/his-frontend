import { patientsService } from '@/modules/patients/services/patients.service'

export const AGENT_PATIENT_PREFILL_KEY = 'his_agent_patient_prefill'

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function extractItems(payload) {
  const rawItems = payload?.data || payload?.patients || payload?.items || payload || []
  return Array.isArray(rawItems) ? rawItems : []
}

function agentFullName(agent) {
  return [agent?.nom_post, agent?.prenom].filter(Boolean).join(' ').trim()
}

function buildAgentBeneficiary(agent) {
  return {
    key: `SELF-${agent.cac_id_co}`,
    relation: 'SELF',
    relation_label: 'Agent lui-même',
    beneficiary_name: agentFullName(agent),
    nom: agent.nom_post || '',
    postnom: '',
    prenom: agent.prenom || '',
    sexe: agent.sexe || '',
    date_naissance: agent.date_de_naissance || '',
    telephone: agent.telephone || '',
    adresse: agent.adresse || '',
    etat_civil: agent.statut_marital || '',
    contact_nom: agent.nom_conjoint || agent.parents || 'Non spécifié',
    contact_lien: agent.nom_conjoint ? 'Conjoint(e)' : 'Famille',
    contact_telephone: agent.telephone || '',
    agent_cac_id: agent.cac_id_co,
    source_agent: agent,
  }
}

function isSameAgentPatient(patient, beneficiary) {
  const raw = patient?.agent_cac || patient?.agentCac || patient?.raw?.agent_cac || {}
  const patientAgentId = raw.agent_cac_id || raw.cac_id || raw.agentCacId || ''
  const relation = raw.relation_to_agent || raw.relation || ''

  return (
    normalizeText(patientAgentId) === normalizeText(beneficiary.agent_cac_id) &&
    (!relation || normalizeText(relation) === 'self')
  )
}

function buildPatientPrefill(beneficiary) {
  return {
    source: 'AGENT_CAC',
    is_agent_beneficiary: true,
    relation: 'SELF',
    nom: beneficiary.nom || '',
    postnom: '',
    prenom: beneficiary.prenom || '',
    sexe: beneficiary.sexe || '',
    date_naissance: beneficiary.date_naissance || '',
    telephone: beneficiary.telephone || '',
    adresse: beneficiary.adresse || '',
    etat_civil: beneficiary.etat_civil || '',
    personne_contacter: beneficiary.contact_nom || '',
    lien_contact_urgence: beneficiary.contact_lien || 'Famille',
    telephone_urgence: beneficiary.contact_telephone || '',
    montant_fiche: 0,
    paiement_effectue: true,
    mode_paiement: 'AGENT_CAC',
    agent_cac_id: beneficiary.agent_cac_id,
    type_relation: 'SELF',
    nom_du_beneficiaire: beneficiary.beneficiary_name,
    raw: {
      agent_cac: {
        agent_cac_id: beneficiary.agent_cac_id,
        relation_to_agent: 'SELF',
        beneficiary_name: beneficiary.beneficiary_name,
        is_agent_beneficiary: true,
        frais_exoneres: true,
      },
    },
  }
}

export const agentMedicalFileService = {
  buildBeneficiaries(agent) {
    if (!agent?.cac_id_co) return []

    // Le contrat externe actuel ne permet pas d’identifier de façon sûre
    // un conjoint ou un enfant. Seul l’agent lui-même est exploitable.
    return [buildAgentBeneficiary(agent)]
  },

  async findPatientFile(beneficiary) {
    try {
      const payload = await patientsService.search(beneficiary.agent_cac_id)
      return extractItems(payload).find((patient) => isSameAgentPatient(patient, beneficiary)) || null
    } catch {
      return null
    }
  },

  savePrefill(beneficiary) {
    const prefill = buildPatientPrefill(beneficiary)
    sessionStorage.setItem(AGENT_PATIENT_PREFILL_KEY, JSON.stringify(prefill))
    return prefill
  },

  readPrefill() {
    const stored = sessionStorage.getItem(AGENT_PATIENT_PREFILL_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      sessionStorage.removeItem(AGENT_PATIENT_PREFILL_KEY)
      return null
    }
  },

  clearPrefill() {
    sessionStorage.removeItem(AGENT_PATIENT_PREFILL_KEY)
  },
}
