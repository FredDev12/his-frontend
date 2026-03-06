import { defineStore } from "pinia"
import { searchPatients, createPatient, getPatient, updatePatient } from "../api/patients.api"
import { searchAgents } from "../api/agents.api"

const STORAGE_KEY = "his_reception_draft_v1"

const normalize = (v) => (v || "").toString().trim().replace(/\s+/g, " ")

const defaultDraft = () => ({
  // contexte admission (UI only)
  patientType: "public", // public | agent
  relation: "SELF", // SELF | SPOUSE | CHILD | PARENT
  typedChildName: "",

  typePassage: "NEW", // NEW | CONTROLE | REFERENCE | URGENCE
  priorite: "ROUTINE", // ROUTINE | URGENT

  // paiement (UI only)
  payment: {
    requiredAmount: 5000,
    paid: false,
    facture: "",
    recu: "",
    method: "CASH",
    paidAt: ""
  }
})

export const useReceptionStore = defineStore("reception", {
  state: () => ({
    // listes/recherches
    patients: [],
    agents: [],
    selectedAgent: null,
    selectedPatient: null,
    paymentValidated: false,

    // UI states
    loading: {
      searchPatient: false,
      searchAgent: false,
      openPatient: false,
      savePatient: false
    },
    error: null,
    hasSearchedPatients: false,
    hasSearchedAgents: false,

    // draft reception (persist)
    draft: defaultDraft()
  }),

  getters: {
    isAgentMode: (s) => s.draft.patientType === "agent",
    paymentValidated: (s) => s.draft.payment.paid === true,

    canSubmitPatient: (s) => {
      // règle réception : paiement obligatoire
      return s.draft.payment.paid === true
    },

    admissionSummary: (s) => ({
      patientType: s.draft.patientType,
      relation: s.draft.relation,
      typedChildName: s.draft.typedChildName,
      typePassage: s.draft.typePassage,
      priorite: s.draft.priorite,
      payment: s.draft.payment
    })
  },

  actions: {
    /* ---------------------------
     * Persist draft
     * --------------------------- */
    loadDraft() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const saved = JSON.parse(raw)
        this.draft = { ...defaultDraft(), ...saved }
      } catch (_) {
        // ignore
      }
    },

    setPaymentOk(v){this.paymentValidated = !!v},
    resetPayment(){this.paymentValidated = false},

    saveDraft() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.draft))
      } catch (_) {
        // ignore
      }
    },

    resetDraft() {
      this.draft = defaultDraft()
      this.saveDraft()
    },

    /* ---------------------------
     * Draft setters (UI)
     * --------------------------- */
    setPatientType(type) {
      this.draft.patientType = type === "agent" ? "agent" : "public"
      // reset contexte quand on change de mode
      this.selectedAgent = null
      this.selectedPatient = null
      this.agents = []
      this.patients = []
      this.saveDraft()
    },

    setRelation(rel) {
      this.draft.relation = rel
      this.saveDraft()
    },

    setTypedChildName(name) {
      this.draft.typedChildName = name
      this.saveDraft()
    },

    setTypePassage(v) {
      this.draft.typePassage = v
      this.saveDraft()
    },

    setPriorite(v) {
      this.draft.priorite = v
      this.saveDraft()
    },

    setPaymentPaid({ facture = "", recu = "", method = "CASH", amount } = {}) {
      this.draft.payment.paid = true
      if (typeof amount === "number") this.draft.payment.requiredAmount = amount
      this.draft.payment.facture = facture
      this.draft.payment.recu = recu
      this.draft.payment.method = method
      this.draft.payment.paidAt = new Date().toISOString()
      this.saveDraft()
    },

    setPaymentUnpaid() {
      this.draft.payment.paid = false
      this.draft.payment.paidAt = ""
      this.saveDraft()
    },

    /* ---------------------------
     * Selection
     * --------------------------- */
    selectAgent(agent) {
      this.selectedAgent = agent
      this.selectedPatient = null
      this.saveDraft()
    },

    selectPatient(patient) {
      this.selectedPatient = patient
      this.saveDraft()
    },

    /* ---------------------------
     * API calls
     * --------------------------- */
    async searchPatient(query) {
      const q = normalize(query)
      this.error = null
      this.hasSearchedPatients = true

      if (q.length < 2) {
        this.patients = []
        return []
      }

      this.loading.searchPatient = true
      try {
        const res = await searchPatients(q)
        this.patients = res?.data?.data || []
        return this.patients
      } catch (e) {
        this.patients = []
        this.error = "Erreur lors de la recherche de patients"
        throw e
      } finally {
        this.loading.searchPatient = false
      }
    },

    async searchAgent(query) {
      const q = normalize(query)
      this.error = null
      this.hasSearchedAgents = true

      if (q.length < 2) {
        this.agents = []
        return []
      }

      this.loading.searchAgent = true
      try {
        const res = await searchAgents({ nom_post: q })
        this.agents = res?.data?.data || []
        return this.agents
      } catch (e) {
        this.agents = []
        this.error = "Erreur lors de la recherche d’agents"
        throw e
      } finally {
        this.loading.searchAgent = false
      }
    },

    // ouvrir fiche complète (important quand on clique un résultat search)
    async openPatientById(id) {
      this.loading.openPatient = true
      this.error = null
      try {
        const res = await getPatient(id)
        const full = res?.data?.data
        if (full) this.selectedPatient = full
        return full
      } catch (e) {
        this.error = "Erreur ouverture fiche patient"
        throw e
      } finally {
        this.loading.openPatient = false
      }
    },

    // create ou update (selon présence selectedPatient.id)
    async savePatient(payload) {
      this.loading.savePatient = true
      this.error = null
      try {
        if (this.selectedPatient?.id) {
          await updatePatient(this.selectedPatient.id, payload)
          return { mode: "update" }
        }
        await createPatient(payload)
        return { mode: "create" }
      } catch (e) {
        this.error = "Erreur sauvegarde patient"
        throw e
      } finally {
        this.loading.savePatient = false
      }
    }
  }
})