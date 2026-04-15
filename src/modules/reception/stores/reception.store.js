import { defineStore } from "pinia"
import { ref } from "vue"

import{
    getReception,
    createReception,
    getRecentesReception,
    getUrgentesReception,
    getStatReception,
    getSearchReception,
    getPatientReceptionById,
    createReceptionAdmissions,
    createReceptionAdmissionsPayment,
    getReceptionById,
    updateReceptionById,
    deleteReceptionById,
    updateStatus
} from "../../../api/reception.api"
import { PatientsQueryParamsType } from "../components/patients/types/patients"


const formatReceptionPayload = (data, patient) => {
  return {
    identification_patient: {
      numero_patient: patient.numero_patient,
      nom: patient.nom,
      prenom: patient.prenom
    },

    paiement_fiche: {
      montant_fiche: data.montant_fiche || 0,
      paiement_effectue: data.paiement_effectue || false,
      mode_paiement: data.mode_paiement || "CASH"
    },

    created_at: new Date().toISOString(),
    numero_fiche: data.numero_fiche
  }
}

export const useReceptionStore = defineStore("reception", () => {

  const loading = ref(false)
  const error = ref(null)

  // =========================
  // CREATE RECEPTION (ADMISSION)
  // =========================
  const createAdmission = async (form, patient) => {
    loading.value = true
    try {
      const formatted = formatReceptionPayload(form, patient)

      const res = await createReceptionAdmissions(formatted)

      return res.data
    } catch (err) {
      error.value = err
      console.error("Erreur réception :", err.response?.data)
      throw err
    } finally {
      loading.value = false
    }
  }


  const fetchPatients = async(params = PatientsQueryParamsType) => {
    loading.value = true
    try {

      const res = await getReception(params)

      return res.data
    } catch (err) {
      error.value = err
      console.error("Erreur réception :", err.response?.data)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPatientReception = async (id) => {

    loading.value = true

    try {

      const res = await getPatientReceptionById(id)

      return res.data

    } catch (err) {

      error.value = err

      console.error("Erreur réception :", err.response?.data)

      throw err

    } finally {

      loading.value = false

    }

  }

  // =========================
  // UPDATE STATUS (SOCKET)
  // =========================
  const updateReceptionStatus = async (id, status) => {
    try {
      await updateStatus(id, {
        status
      })
    } catch (err) {
      console.error("Erreur status :", err)
    }
  }

  return {
    loading,
    error,
    createAdmission,
    fetchPatients,
    getPatientReception,
    updateReceptionStatus
  }
})