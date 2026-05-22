const ACTIVE_FICHE_KEY = 'his_active_fiche_context'

function now() {
  return new Date().toISOString()
}

function clean(value) {
  return String(value || '').trim()
}

export function patientFullNameFromFiche(context = {}) {
  return [
    context.nom,
    context.postnom,
    context.prenom,
    context.patient?.nom,
    context.patient?.postnom,
    context.patient?.prenom,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

export function normalizeFicheContext(payload = {}) {
  const raw = payload.raw || payload

  const patient = raw.patient || raw.identification_patient || payload.patient || {}

  return {
    numero_fiche: clean(payload.numero_fiche) || clean(raw.numero_fiche) || clean(raw.numeroFiche),

    numero_patient:
      clean(payload.numero_patient) ||
      clean(raw.numero_patient) ||
      clean(raw.numeroPatient) ||
      clean(patient.numero_patient),

    patient_id: payload.patient_id || raw.patient_id || raw.patientId || patient.id || null,

    nom: clean(payload.nom) || clean(raw.nom) || clean(patient.nom),

    postnom: clean(payload.postnom) || clean(raw.postnom) || clean(patient.postnom),

    prenom:
      clean(payload.prenom) ||
      clean(payload.prénom) ||
      clean(raw.prenom) ||
      clean(raw.prénom) ||
      clean(patient.prenom) ||
      clean(patient.prénom),

    sexe: clean(payload.sexe) || clean(raw.sexe) || clean(patient.sexe),

    age: payload.age ?? raw.age ?? patient.age ?? '',

    telephone: clean(payload.telephone) || clean(raw.telephone) || clean(patient.telephone),

    statut: clean(payload.statut) || clean(raw.statut) || clean(raw.status) || 'active',

    service:
      clean(payload.service) ||
      clean(payload.service_entree) ||
      clean(raw.service) ||
      clean(raw.service_entree),

    source_module: clean(payload.source_module) || clean(raw.source_module),

    opened_at: payload.opened_at || payload.created_at || raw.opened_at || raw.created_at || now(),
  }
}

export const ficheWorkflowService = {
  setActiveFiche(payload = {}) {
    const context = normalizeFicheContext(payload)

    if (!context.numero_fiche) {
      throw new Error('Numéro de fiche requis pour initialiser le workflow.')
    }

    sessionStorage.setItem(ACTIVE_FICHE_KEY, JSON.stringify(context))

    return context
  },

  getActiveFiche() {
    const stored = sessionStorage.getItem(ACTIVE_FICHE_KEY)

    if (!stored) return null

    try {
      const parsed = JSON.parse(stored)
      return normalizeFicheContext(parsed)
    } catch {
      sessionStorage.removeItem(ACTIVE_FICHE_KEY)
      return null
    }
  },

  clearActiveFiche() {
    sessionStorage.removeItem(ACTIVE_FICHE_KEY)
  },

  ensureNumeroFiche(payload = {}, fallback = {}) {
    const context = normalizeFicheContext({
      ...fallback,
      ...payload,
    })

    if (!context.numero_fiche) {
      throw new Error('Le numéro de fiche est obligatoire pour continuer le workflow.')
    }

    return context.numero_fiche
  },

  buildWorkflowPayload(payload = {}, fallback = {}) {
    const context = normalizeFicheContext({
      ...fallback,
      ...payload,
    })

    if (!context.numero_fiche) {
      throw new Error('Le numéro de fiche est obligatoire pour créer cette opération.')
    }

    return {
      ...payload,

      // Identifiant principal du workflow
      numero_fiche: context.numero_fiche,

      // Gardé pour affichage/contexte, pas comme identifiant principal du passage
      numero_patient: context.numero_patient || payload.numero_patient || '',

      patient_context: {
        numero_fiche: context.numero_fiche,
        numero_patient: context.numero_patient,
        patient_id: context.patient_id,
        nom: context.nom,
        postnom: context.postnom,
        prenom: context.prenom,
        sexe: context.sexe,
        age: context.age,
        telephone: context.telephone,
        statut: context.statut,
        service: context.service,
      },
    }
  },
}
