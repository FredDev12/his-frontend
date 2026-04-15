/**
 * Consultation type definitions
 */

// Statuts de consultation
export const ConsultationStatus = {
  EN_ATTENTE: 'EN_ATTENTE',
  EN_COURS: 'EN_COURS',
  TERMINEE: 'TERMINEE',
  ANNULEE: 'ANNULEE'
}

// Types de consultation
export const ConsultationType = {
  GENERALE: 'GENERALE',
  SPECIALISEE: 'SPECIALISEE',
  URGENCE: 'URGENCE',
  SUIVI: 'SUIVI'
}

// Consultation type definition
export const ConsultationSchema = {
  id: Number,
  patientId: Number,
  medecinId: Number,
  dateConsultation: Date,
  heureConsultation: String,
  motif: String,
  type: String, // ConsultationType
  statut: String, // ConsultationStatus
  diagnostic: String,
  traitement: String,
  prescriptions: Array,
  examens: Array,
  notes: String,
  poids: Number,
  taille: Number,
  temperature: Number,
  tension: String,
  createdAt: Date,
  updatedAt: Date,

  // Relations
  patient: Object,
  medecin: Object
}

// Formulaire de création/modification
export const ConsultationFormSchema = {
  patientId: Number,
  medecinId: Number,
  dateConsultation: Date,
  heureConsultation: String,
  motif: String,
  type: String,
  diagnostic: String,
  traitement: String,
  prescriptions: Array,
  examens: Array,
  notes: String,
  poids: Number,
  taille: Number,
  temperature: Number,
  tension: String
}

// Filtres de recherche
export const ConsultationFiltersSchema = {
  patientId: Number,
  medecinId: Number,
  statut: String,
  type: String,
  dateDebut: Date,
  dateFin: Date,
  motif: String
}