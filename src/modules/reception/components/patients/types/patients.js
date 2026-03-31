// src/modules/patients/types/patients.js

// ======================================================
// CORE PATIENT ENTITY (CREATE / UPDATE BASE)
// ======================================================
export const PatientBaseType = {
  nom: "",
  prenom: "",
  postnom: "",
  sexe: "M", // M | F
  date_naissance: "",
  age: "",
  etat_civil: "",
  telephone: "",
  adresse: "",
  personne_a_contacter: "",
  telephone_urgence: "",
  type_passage: "NEW", // NEW | FOLLOW_UP | URGENT (selon backend)
  service_entree: "",
  priorite: "ROUTINE", // ROUTINE | URGENT | EMERGENCY
  montant_fiche: 0,
  paiement_effectue: false,
  mode_paiement: "CASH" // CASH | MOBILE_MONEY | CARD
}

// Alias explicite pour POST
export const PatientCreateType = {
  ...PatientBaseType
}

// ======================================================
// UPDATE PATIENT (PUT / PATCH)
// (souvent même structure que create mais flexible)
// ======================================================
export const PatientUpdateType = {
  ...PatientBaseType
}

// ======================================================
// PATIENT RESPONSE ENTITY (GET /{id})
// ======================================================
export const PatientType = {
  id: null,
  ...PatientBaseType,
  created_at: "",
  updated_at: ""
}

// ======================================================
// PAGINATION RESPONSE (GET /api/patients)
// ======================================================
export const PatientsPaginatedType = {
  data: [PatientType],

  page: 1,
  limit: 10,
  total: 0,

  hasNext: false,
  hasPrev: false
}

// ======================================================
// SEARCH RESPONSE (GET /api/patients/search?q=)
// ======================================================
export const PatientsSearchType = {
  data: [PatientType]
}

// ======================================================
// SINGLE GET RESPONSE (/api/patients/{id})
// ======================================================
export const PatientDetailResponseType = {
  data: PatientType
}

// ======================================================
// UPDATE RESPONSE (PUT)
// ======================================================
export const PatientUpdateResponseType = {
  data: PatientType
}

// ======================================================
// DELETE RESPONSE
// ======================================================
export const PatientDeleteResponseType = {
  data: null
}

// ======================================================
// QUERY PARAMS (OPTIONAL HELPERS FRONTEND)
// ======================================================
export const PatientsQueryParamsType = {
  page: 1,
  limit: 10
}

export const PatientSearchQueryType = {
  q: ""
}