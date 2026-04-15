// src/modules/consultation/stores/consultation.store.js

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { PaginatedType, QueryParamsType } from "../../../utils/pagination"

import {
    getConsultations,
    createConsultation,
    getConsultationById,
    updateConsultationById,
    deleteConsultationById
} from "../../../api/consultation.api"

export const useConsultationStore = defineStore("consultation", () => {
  // =========================
  // STATE
  // =========================
  const consultations = ref()
  const consultation = ref()
  const searchResults = ref()

  const loading = ref(false)
  const error = ref(null)

  // =========================
  // GET ALL (pagination)
  // =========================
  const fetchConsultations = async (params = {}) => {
    loading.value = true
    try {
      const res = await getConsultations(params)
      consultations.value = res
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // GET ONE
  // =========================
  const fetchConsultation = async (id) => {
    loading.value = true
    try {
      const res = await getConsultationById(id)
      consultation.value = res.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // CREATE
  // =========================
  const createNewConsultation = async (data) => {
    loading.value = true
    try {
      const res = await createConsultation(data)
      return res.data
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
  const updateConsultation = async (id, data) => {
    loading.value = true
    try {
      const res = await updateConsultationById(id, data)
      consultation.value = res.data
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
  const deleteConsultation = async (id) => {
    loading.value = true
    try {
      await deleteConsultationById(id)
      // Remove from local state if exists
      if (consultations.value?.data) {
        consultations.value.data = consultations.value.data.filter(c => c.id !== id)
      }
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // =========================
  // COMPUTED
  // =========================
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const consultationsList = computed(() => consultations.value?.data || [])
  const consultationsMeta = computed(() => consultations.value?.meta || {})

  // =========================
  // RESET
  // =========================
  const reset = () => {
    consultations.value = null
    consultation.value = null
    searchResults.value = null
    error.value = null
  }

  return {
    // State
    consultations,
    consultation,
    searchResults,
    loading,
    error,

    // Actions
    fetchConsultations,
    fetchConsultation,
    createNewConsultation,
    updateConsultation,
    deleteConsultation,
    reset,

    // Computed
    isLoading,
    hasError,
    consultationsList,
    consultationsMeta
  }
})