// src/modules/patients/stores/patients.store.js

import { defineStore } from "pinia"
import { ref, computed } from "vue"

import {
  PatientsPaginatedType,
  PatientDetailResponseType,
  PatientsSearchType,
  PatientsQueryParamsType,
  PatientSearchQueryType
} from "../types/patients"

import {
  getPatient,
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients
} from "../../../../../api/patients.api"


import {
  createReception
} from "../../../../../api/reception.api"

const mapRelation = (relation) => {
  switch (relation) {
    case "agent": return "SELF"
    case "conjoint": return "SPOUSE"
    case "enfant": return "CHILD"
    case "parent": return "PARENT"
    default: return "PUBLIC"
  }
}

const formatPatientPayload = (data) => {
  const cleanData = JSON.parse(JSON.stringify(data))
  
  let created_at = new Date().toISOString()


  const [year, month, day] = cleanData.created_date.split("-")
  const [hour, minute] = cleanData.created_time.split(":")

  const localDate = new Date(
    year,
    month - 1, // ⚠️ mois commence à 0
    day,
    hour,
    minute
  )

  created_at = localDate.toISOString()

  const isPublic = cleanData.type_relation?.toLowerCase() === "public"

  const relation = isPublic ? "SELF" : mapRelation(cleanData.type_relation)

  let agentCac = {}

  if (cleanData.agent_id && !isPublic) {
    agentCac = {
      agent_cac_id: String(cleanData.agent_id),
      relation_to_agent: relation,
      beneficiary_name: `${cleanData.nom} ${cleanData.prenom}`
    }
  }

  let paiementFiche = {}

  
    paiementFiche = {
      montant_fiche: cleanData.montant_fiche || 10,
      paiement_effectue: cleanData.paiement_effectue || true,
      mode_paiement: cleanData.mode_paiement || "CASH",

      facture_numero: "N/A",
      recu_numero: "N/A",
      date_paiement: new Date().toISOString().split("T")[0]
    }

  return {
    identification_patient: {
      numero_patient: cleanData.numero_fiche, // ou générer
      nom: cleanData.nom,
      postnom: cleanData.postnom,
      prenom: cleanData.prenom,
      sexe: cleanData.sexe,
      date_naissance: cleanData.date_naissance,
      age: parseInt(cleanData.age),
      telephone: cleanData.telephone,
      adresse: cleanData.adresse,
      personne_contacter: cleanData.personne_a_contacter || "Non spécifié",
      telephone_urgence: cleanData.telephone_urgence || "Non spécifié",
      etat_civil: cleanData.etat_civil?.replace("(e)", "") || "Célibataire",
      contact_urgence: {
        nom: cleanData.personne_a_contacter || "Non spécifié",
        lien: cleanData.lien || "Non spécifié",
        telephone: cleanData.telephone_urgence || cleanData.telephone
      }
    },

    paiement_fiche: paiementFiche,

    agent_cac: agentCac,

    created_at,
    numero_fiche: cleanData.numero_fiche,
    type_relation: relation,
    status: "active"
  }
}

export const usePatientsStore = defineStore("patients", () => {
  // =========================
  // STATE
  // =========================
  const patients = ref({ ...PatientsPaginatedType })
  const patient = ref({ ...PatientDetailResponseType })
  const searchResults = ref({ ...PatientsSearchType })

  const loading = ref(false)
  const error = ref(null)

  // =========================
  // GET ALL (pagination)
  // =========================
  const fetchPatients = async (params = PatientsQueryParamsType) => {
    loading.value = true
    try {
      const res = await getPatients(params)

      patients.value = res

      return res.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // GET ONE
  // =========================
  const fetchPatient = async (id) => {
    loading.value = true
    try {
      const res = await getPatient(id)

      patient.value = res
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // CREATE
  // =========================
  const addPatient = async (payload) => {
    loading.value = true
    try {

      // 🔥 transformation
      const formattedPayload = formatPatientPayload(payload)


      const res = await createReception(formattedPayload)


      return res.data
    } catch (err) {
      error.value = err.response?.data

      throw err.response?.data
    } finally {
      loading.value = false
    }
  }

  // =========================
  // UPDATE
  // =========================
  const editPatient = async (id, payload) => {
    loading.value = true
    try {
      const res = await updatePatient(id, payload)
      return res.data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // DELETE
  // =========================
  const removePatient = async (id) => {
    loading.value = true
    try {
      const res = await deletePatient(id)
      return res.data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // SEARCH
  // =========================
  const search = async (q = "") => {
    loading.value = true
    try {
      const res = await searchPatients({ q })
      searchResults.value = res.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // GETTERS
  // =========================
  const patientList = computed(() => patients.value.data || [])
  const totalPatients = computed(() => patients.value.total || 0)

  return {
    // state
    patients,
    patient,
    searchResults,
    loading,
    error,

    // actions
    fetchPatients,
    fetchPatient,
    addPatient,
    editPatient,
    removePatient,
    search,

    // getters
    patientList,
    totalPatients
  }
})