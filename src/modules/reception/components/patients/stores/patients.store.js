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
      console.log(res);
      
      patients.value = res
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
      console.log(res);
      
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
      console.log("ajout patient : ", payload);
      
      const res = await createPatient(payload)

      console.log("reponse enregistement patient :", res);
      
      //return res.data
    } catch (err) {
      error.value = err
      console.log("error de creation", err);
      
      throw err
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