import { defineStore } from "pinia"
import { searchService } from "@/modules/search/services/search.service"

const EMPTY_RESULTS = {
  patients: [],
  episodes: [],
  factures: [],
  paiements: [],
  consultations: [],
  examens: [],
  prescriptions: [],
  hospitalisations: [],
  sorties: [],
  total: 0,
}

export const useSearchStore = defineStore("search", {
  state: () => ({
    q: "",
    results: { ...EMPTY_RESULTS },
    loading: false,
    error: "",
    hasSearched: false,
  }),

  getters: {
    hasResults: (state) => Number(state.results.total || 0) > 0,

    groupedResults: (state) => [
      { key: "patients", label: "Patients", items: state.results.patients || [] },
      { key: "episodes", label: "Épisodes", items: state.results.episodes || [] },
      { key: "factures", label: "Factures", items: state.results.factures || [] },
      { key: "paiements", label: "Paiements", items: state.results.paiements || [] },
      { key: "consultations", label: "Consultations", items: state.results.consultations || [] },
      { key: "examens", label: "Examens", items: state.results.examens || [] },
      { key: "prescriptions", label: "Prescriptions", items: state.results.prescriptions || [] },
      { key: "hospitalisations", label: "Hospitalisations", items: state.results.hospitalisations || [] },
      { key: "sorties", label: "Sorties", items: state.results.sorties || [] },
    ].filter((group) => group.items.length > 0),
  },

  actions: {
    clear() {
      this.q = ""
      this.results = { ...EMPTY_RESULTS }
      this.loading = false
      this.error = ""
      this.hasSearched = false
    },

    async search(q, limit = 5) {
      const query = String(q || "").trim()
      this.q = query
      this.error = ""

      if (query.length < 2) {
        this.results = { ...EMPTY_RESULTS }
        this.hasSearched = false
        return this.results
      }

      this.loading = true
      this.hasSearched = true

      try {
        const payload = await searchService.globalSearch({ q: query, limit })
        const data = payload?.data || payload || {}

        this.results = {
          ...EMPTY_RESULTS,
          ...data,
          total: Number(data.total || 0),
        }

        return this.results
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Recherche globale indisponible."

        this.results = { ...EMPTY_RESULTS }
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
