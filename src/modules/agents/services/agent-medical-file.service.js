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
  const rawItems =
    payload?.data ||
    payload?.patients ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    payload ||
    []

  return Array.isArray(rawItems) ? rawItems : []
}

function splitFullName(value) {
  const parts = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return {
    nom: parts[0] || '',
    postnom: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    prenom: parts.length > 1 ? parts[parts.length - 1] : '',
  }
}

function agentFullName(agent) {
  return [agent?.nom_post, agent?.prenom].filter(Boolean).join(' ').trim()
}

function relationLabel(relation) {
  const labels = {
    SELF: 'Agent lui-même',
    SPOUSE: 'Conjoint(e)',
    CHILD: 'Enfant',
  }

  return labels[relation] || relation
}

function buildAgentBeneficiary(agent) {
  const name = agentFullName(agent)

  return {
    key: `SELF-${agent.cac_id_co}`,
    relation: 'SELF',
    relation_label: relationLabel('SELF'),
    beneficiary_name: name,
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

function buildSpouseBeneficiary(agent) {
  if (!agent?.nom_conjoint) return null

  const nameParts = splitFullName(agent.nom_conjoint)

  return {
    key: `SPOUSE-${agent.cac_id_co}`,
    relation: 'SPOUSE',
    relation_label: relationLabel('SPOUSE'),
    beneficiary_name: agent.nom_conjoint,
    nom: nameParts.nom || agent.nom_conjoint,
    postnom: nameParts.postnom || '',
    prenom: nameParts.prenom || '',
    sexe: '',
    date_naissance: '',
    telephone: agent.telephone || '',
    adresse: agent.adresse || '',
    etat_civil: 'Marié',
    contact_nom: agentFullName(agent),
    contact_lien: 'Conjoint(e)',
    contact_telephone: agent.telephone || '',
    agent_cac_id: agent.cac_id_co,
    source_agent: agent,
  }
}

function buildChildBeneficiaries(agent) {
  const enfants = Array.isArray(agent?.enfants) ? agent.enfants : []

  return enfants.map((child, index) => {
    const nameParts = splitFullName(child.nom)

    return {
      key: `CHILD-${agent.cac_id_co}-${index}`,
      relation: 'CHILD',
      relation_label: `${relationLabel('CHILD')} ${index + 1}`,
      beneficiary_name: child.nom || `Enfant ${index + 1}`,
      nom: nameParts.nom || child.nom || '',
      postnom: nameParts.postnom || '',
      prenom: nameParts.prenom || '',
      sexe: child.sexe || '',
      date_naissance: '',
      telephone: agent.telephone || '',
      adresse: agent.adresse || '',
      etat_civil: 'Célibataire',
      contact_nom: agentFullName(agent),
      contact_lien: 'Parent',
      contact_telephone: agent.telephone || '',
      agent_cac_id: agent.cac_id_co,
      source_agent: agent,
    }
  })
}

function isSameBeneficiary(patient, beneficiary) {
  const raw = patient?.agent_cac || patient?.agentCac || patient?.raw?.agent_cac || {}
  const patientAgentId = raw.agent_cac_id || raw.cac_id || raw.agentCacId || ''
  const relation = raw.relation_to_agent || raw.relation_a_agent || raw.relation || ''
  const beneficiaryName =
    raw.beneficiary_name || raw.nom_du_beneficiaire || raw.nom_du_bénéficiaire || ''

  const patientName = normalizeText(
    [
      patient?.nom,
      patient?.postnom,
      patient?.prenom,
      patient?.identification_patient?.nom,
      patient?.identification_patient?.postnom,
      patient?.identification_patient?.prenom,
    ]
      .filter(Boolean)
      .join(' '),
  )

  const expectedName = normalizeText(beneficiary.beneficiary_name)

  const agentMatches = normalizeText(patientAgentId) === normalizeText(beneficiary.agent_cac_id)

  const relationMatches =
    !relation || normalizeText(relation) === normalizeText(beneficiary.relation)

  const beneficiaryMatches =
    normalizeText(beneficiaryName) === expectedName ||
    patientName.includes(expectedName) ||
    expectedName.includes(patientName)

  return agentMatches && relationMatches && beneficiaryMatches
}

function buildPatientPrefill(beneficiary) {
  const agent = beneficiary.source_agent || {}
  const today = new Date().toISOString().slice(0, 10)

  return {
    source: 'AGENT_CAC',
    is_agent_beneficiary: true,
    relation: beneficiary.relation,

    numero_patient: '',
    numero_fiche: '',

    nom: beneficiary.nom || '',
    postnom: beneficiary.postnom || '',
    prenom: beneficiary.prenom || '',
    sexe: beneficiary.sexe || '',
    date_naissance: beneficiary.date_naissance || '',
    age: '',
    telephone: beneficiary.telephone || '',
    adresse: beneficiary.adresse || '',
    etat_civil: beneficiary.etat_civil || '',

    personne_contacter: beneficiary.contact_nom || agent.nom_conjoint || agent.parents || '',
    lien_contact_urgence: beneficiary.contact_lien || 'Famille',
    telephone_urgence: beneficiary.contact_telephone || beneficiary.telephone || '',

    montant_fiche: 0,
    paiement_effectue: true,
    mode_paiement: 'AGENT_CAC',

    agent_cac_id: beneficiary.agent_cac_id,
    type_relation: beneficiary.relation,
    nom_du_beneficiaire: beneficiary.beneficiary_name,

    raw: {
      created_at: new Date().toISOString(),
      type_relation: beneficiary.relation,
      paiement_fiche: {
        montant_fiche: 0,
        paiement_effectue: true,
        mode_paiement: 'AGENT_CAC',
        facture_numero: 'AGENT-CAC',
        recu_numero: 'AGENT-CAC',
        date_paiement: today,
      },
      agent_cac: {
        agent_cac_id: beneficiary.agent_cac_id,
        relation_to_agent: beneficiary.relation,
        beneficiary_name: beneficiary.beneficiary_name,
        is_agent_beneficiary: true,
        frais_exoneres: true,
      },
      identification_patient: {
        nom: beneficiary.nom || '',
        postnom: beneficiary.postnom || '',
        prenom: beneficiary.prenom || '',
        sexe: beneficiary.sexe || '',
        date_naissance: beneficiary.date_naissance || null,
        telephone: beneficiary.telephone || '',
        adresse: beneficiary.adresse || '',
        personne_contacter: beneficiary.contact_nom || '',
        telephone_urgence: beneficiary.contact_telephone || '',
        etat_civil: beneficiary.etat_civil || '',
        contact_urgence: {
          nom: beneficiary.contact_nom || '',
          lien: beneficiary.contact_lien || 'Famille',
          telephone: beneficiary.contact_telephone || '',
        },
      },
    },
  }
}

export const agentMedicalFileService = {
  buildBeneficiaries(agent) {
    if (!agent) return []

    return [
      buildAgentBeneficiary(agent),
      buildSpouseBeneficiary(agent),
      ...buildChildBeneficiaries(agent),
    ].filter(Boolean)
  },

  async findPatientFile(beneficiary) {
    const queries = [beneficiary.agent_cac_id, beneficiary.beneficiary_name].filter(Boolean)

    for (const query of queries) {
      try {
        const payload = await patientsService.search(query)
        const items = extractItems(payload)

        const match = items.find((patient) => isSameBeneficiary(patient, beneficiary))

        if (match) {
          return match
        }
      } catch {
        // On continue avec la requête suivante.
      }
    }

    return null
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
