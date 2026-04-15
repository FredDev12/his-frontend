import { searchPatients } from "../../../api/patients.api"
import { searchAgents } from "../../../api/agents.api"

export const findPatient = async (query) => {
  const res = await searchPatients(query)
  return res.data.data
}

export const findMedecin = async (query) => {
  // Pour l'instant, chercher parmi les agents avec fonction MEDECIN
  const res = await searchAgents({ fonction: 'MEDECIN', nom_post: query })
  return res.data.data
}

const clean = (v) => {
  const s = (v ?? "").toString().trim()
  if (!s) return ""
  if (s.toLowerCase() === "null") return ""
  return s.replace(/\s+/g, " ").trim()
}

const phoneTokens = (phone) => {
  const s = clean(phone)
  if (!s) return []
  // split par -, /, espace, virgule
  return s.split(/[-/,\s]+/).map(p => p.trim()).filter(Boolean)
}

export const smartFindExistingPatient = async ({ patientName, phone }) => {
  const queries = []

  if (clean(patientName)) {
    const nameParts = clean(patientName).split(' ')
    queries.push(...nameParts)
  }

  if (phone) {
    phoneTokens(phone).forEach(t => queries.push(t))
  }

  if (queries.length === 0) return []

  try {
    const res = await searchPatients({ q: queries.join(' ') })
    return res.data.data || []
  } catch (error) {
    console.error('Erreur lors de la recherche intelligente de patient:', error)
    return []
  }
}

// Validation des données de consultation
export const validateConsultationData = (data) => {
  const errors = []

  if (!data.patientId) errors.push('Patient requis')
  if (!data.medecinId) errors.push('Médecin requis')
  if (!data.dateConsultation) errors.push('Date requise')
  if (!data.heureConsultation) errors.push('Heure requise')
  if (!data.type) errors.push('Type de consultation requis')

  // Validation des constantes
  if (data.poids && (data.poids < 0 || data.poids > 500)) {
    errors.push('Poids invalide')
  }
  if (data.taille && (data.taille < 0 || data.taille > 300)) {
    errors.push('Taille invalide')
  }
  if (data.temperature && (data.temperature < 30 || data.temperature > 45)) {
    errors.push('Température invalide')
  }

  return errors
}

// Formatage des données pour affichage
export const formatConsultationForDisplay = (consultation) => {
  return {
    ...consultation,
    dateFormatted: consultation.dateConsultation ?
      new Date(consultation.dateConsultation).toLocaleDateString('fr-FR') : '',
    heureFormatted: consultation.heureConsultation || '',
    patientName: consultation.patient ?
      `${consultation.patient.nom} ${consultation.patient.prenom}` : '',
    medecinName: consultation.medecin ?
      `Dr. ${consultation.medecin.nom} ${consultation.medecin.prenom}` : '',
    imc: consultation.poids && consultation.taille ?
      (consultation.poids / ((consultation.taille / 100) ** 2)).toFixed(1) : null
  }
}

// Calcul de l'IMC avec catégorie
export const calculateIMCWithCategory = (poids, taille) => {
  if (!poids || !taille) return null

  const imc = (poids / ((taille / 100) ** 2)).toFixed(1)
  let category = ''

  if (imc < 18.5) category = 'Insuffisance pondérale'
  else if (imc < 25) category = 'Poids normal'
  else if (imc < 30) category = 'Surpoids'
  else if (imc < 35) category = 'Obésité modérée'
  else if (imc < 40) category = 'Obésité sévère'
  else category = 'Obésité morbide'

  return { imc, category }
}