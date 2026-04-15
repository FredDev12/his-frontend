// src/modules/triage/stores/triage.store.js

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { PaginatedType, QueryParamsType } from "../../../utils/pagination"

import {
    getTriage,
    createTriage,
    getTriageById,
    updateTriageById,
    deleteTriageById

} from "../../../api/triage.api"

export const useTriageStore = defineStore("triage", () => {
  // =========================
  // STATE
  // =========================
  const patients = ref()
  const patient = ref()
  const searchResults = ref()

  const loading = ref(false)
  const error = ref(null)

  // =========================
  // GET ALL (pagination)
  // =========================
  const fetchPatients = async (params = {PaginatedType}) => {
    loading.value = true
    try {
      const res = await getTriage(params)
      
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
      const res = await getTriageById(id)
      
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
      
      const res = await createTriage(payload)

      
      //return res.data
    } catch (err) {
      error.value = err
      
      throw err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // UPDATE
  // =========================
  const editPatient = async (id) => {
    loading.value = true
    try {
      const res = await updateTriageById(id)
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
      const res = await deleteTriageById(id)
      return res.data
    } catch (err) {
      error.value = err
      throw err
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

    // getters
    patientList,
    totalPatients
  }
})