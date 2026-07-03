import { defineStore } from "pinia"
import { dmeService } from "@/modules/dme/services/dme.service"

function pick(obj, keys, fallback = "") {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key]
  }

  return fallback
}

function normalizeMedicalRecord(payload = {}) {
  const data = payload?.data || payload?.record || payload

  return {
    patient: data.patient || data.identification_patient || null,
    episode: data.episode || data.currentEpisode || data.episodeActif || null,
    summary: data.summary || data.resume || {},
    timeline: data.timeline || data.evenements || [],
    consultations: data.consultations || [],
    examens: data.examens || [],
    prescriptions: data.prescriptions || [],
    pharmacie: data.pharmacie || [],
    factures: data.factures || [],
    paiements: data.paiements || [],
    hospitalisations: data.hospitalisations || [],
    sortie: data.sortie || null,
    audit: data.audit || [],
  }
}

export const useDmeStore = defineStore("dme", {
  state: () => ({
    patient: null,
    episode: null,
    summary: {},
    timeline: [],
    consultations: [],
    examens: [],
    prescriptions: [],
    pharmacie: [],
    factures: [],
    paiements: [],
    hospitalisations: [],
    sortie: null,
    audit: [],

    loading: false,
    loadingTimeline: false,
    error: "",
  }),

  getters: {
    patientName: (state) => {
      const patient = state.patient || {}
      return [patient.nom, patient.postnom, patient.prenom].filter(Boolean).join(" ") || "Patient"
    },

    dmeKpis: (state) => ({
      consultations: state.consultations.length,
      examens: state.examens.length,
      prescriptions: state.prescriptions.length,
      factures: state.factures.length,
      paiements: state.paiements.length,
      hospitalisations: state.hospitalisations.length,
      evenements: state.timeline.length,
      audit: state.audit.length,
    }),

    currentStatus: (state) => {
      return pick(state.episode, ["status", "statut", "etat"], "—")
    },
  },

  actions: {
    async loadMedicalRecord(patientId) {
      this.loading = true
      this.error = ""

      try {
        const payload = await dmeService.getPatientMedicalRecord(patientId)
        const record = normalizeMedicalRecord(payload)

        this.patient = record.patient
        this.episode = record.episode
        this.summary = record.summary
        this.timeline = record.timeline
        this.consultations = record.consultations
        this.examens = record.examens
        this.prescriptions = record.prescriptions
        this.pharmacie = record.pharmacie
        this.factures = record.factures
        this.paiements = record.paiements
        this.hospitalisations = record.hospitalisations
        this.sortie = record.sortie
        this.audit = record.audit

        return record
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Impossible de charger le dossier médical électronique."
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadEpisodeTimeline(episodeId) {
      this.loadingTimeline = true

      try {
        const payload = await dmeService.getEpisodeTimeline(episodeId)
        this.timeline = payload?.data || payload?.timeline || payload?.items || []
        return this.timeline
      } finally {
        this.loadingTimeline = false
      }
    },

    clear() {
      this.patient = null
      this.episode = null
      this.summary = {}
      this.timeline = []
      this.consultations = []
      this.examens = []
      this.prescriptions = []
      this.pharmacie = []
      this.factures = []
      this.paiements = []
      this.hospitalisations = []
      this.sortie = null
      this.audit = []
      this.error = ""
    },
  },
})
