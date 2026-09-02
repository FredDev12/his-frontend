import { defineStore } from 'pinia'
import { agentsService } from '@/modules/agents/services/agents.service'

function text(value) {
  return value === undefined || value === null ? '' : String(value)
}

function parseChildren(value) {
  return text(value)
    .split(/[,;\n]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((nom) => ({ nom }))
}

export function normalizeAgent(item) {
  if (!item || typeof item !== 'object') return null

  return {
    raw: item,
    id: text(item.cac_id_co),
    cac_id_co: text(item.cac_id_co),
    nom_post: text(item.nom_post),
    prenom: text(item.prenom),
    sexe: text(item.sexe),
    grand: text(item.grand),
    fonction: text(item.fonction),
    nationalite: text(item.nationalite),
    site: text(item.site),
    adresse: text(item.adresse),
    statut_marital: text(item.statut_marital),
    nom_conjoint: text(item.nom_conjoint),
    nbre_enfa: text(item.nbre_enfa),
    nom_enfant: text(item.nom_enfant),
    enfants: parseChildren(item.nom_enfant),
    telephone: text(item.telephone),
    date_de_naissance: text(item.date_de_naissance),
    parents: text(item.parents),
    statutparents: text(item.statutparents),
  }
}

export function normalizeListResponse(payload) {
  const rawItems = Array.isArray(payload?.data) ? payload.data : []
  const items = rawItems.map(normalizeAgent).filter(Boolean)

  return {
    items,
    total: Number(payload?.total ?? items.length),
    page: Number(payload?.page ?? 1),
    limite: Number(payload?.limit ?? 100),
    hasNext: Boolean(payload?.hasNext),
    hasPrev: Boolean(payload?.hasPrev),
  }
}

export function normalizeSingleResponse(payload) {
  return normalizeAgent(payload?.item ?? payload)
}

function normalizeStats(payload) {
  const data = payload || {}

  return {
    raw: data,
    total: Number(data.total || 0),
    par_sexe: data.par_sexe || {},
    par_site: data.par_site || {},
    par_fonction: data.par_fonction || {},
    par_statut: data.par_statut || {},
  }
}

function errorMessage(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || fallback
}

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [],
    selectedAgent: null,
    stats: null,

    loading: false,
    loadingDetails: false,
    loadingStats: false,
    searching: false,
    error: '',

    pagination: {
      page: 1,
      limite: 100,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    filters: {
      cac_id_co: '',
      nom_post: '',
      prenom: '',
      site: '',
      telephone: '',
      fonction: '',
    },
  }),

  actions: {
    applyList(payload) {
      const normalized = normalizeListResponse(payload)
      this.agents = normalized.items
      this.pagination = {
        page: normalized.page,
        limite: normalized.limite,
        total: normalized.total,
        hasNext: normalized.hasNext,
        hasPrev: normalized.hasPrev,
      }
      return normalized
    },

    async fetchAgents(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await agentsService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })
        return this.applyList(payload)
      } catch (error) {
        this.error = errorMessage(error, 'Impossible de charger les agents CAC.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchAgents(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        cac_id_co: filters.cac_id_co ?? '',
        nom_post: filters.nom_post ?? '',
        prenom: filters.prenom ?? '',
        site: filters.site ?? '',
        telephone: filters.telephone ?? '',
        fonction: filters.fonction ?? '',
      }

      try {
        const hasFonction = String(this.filters.fonction).trim()
        const hasExternalSearchFilter = [
          this.filters.cac_id_co,
          this.filters.nom_post,
          this.filters.prenom,
          this.filters.site,
          this.filters.telephone,
        ].some((value) => String(value).trim())

        let payload

        if (hasFonction && !hasExternalSearchFilter) {
          payload = await agentsService.getByFonction(this.filters.fonction, {
            page: 1,
            limit: this.pagination.limite,
          })
        } else if (hasExternalSearchFilter) {
          payload = await agentsService.search({
            cac_id_co: this.filters.cac_id_co,
            nom_post: this.filters.nom_post,
            prenom: this.filters.prenom,
            site: this.filters.site,
            telephone: this.filters.telephone,
            page: 1,
            limit: this.pagination.limite,
          })
        } else {
          payload = await agentsService.list({ page: 1, limit: this.pagination.limite })
        }

        const normalized = this.applyList(payload)

        if (hasFonction && hasExternalSearchFilter) {
          const fonction = hasFonction.toLowerCase()
          this.agents = this.agents.filter((agent) =>
            agent.fonction.toLowerCase().includes(fonction),
          )
          this.pagination.total = this.agents.length
          this.pagination.hasNext = false
        }

        return {
          ...normalized,
          items: this.agents,
        }
      } catch (error) {
        this.error = errorMessage(error, 'Recherche agent impossible.')
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchAgentById(idOrCac) {
      this.loadingDetails = true
      this.error = ''
      this.selectedAgent = null

      try {
        const value = String(idOrCac || '').trim()
        const payload = /^\d+$/.test(value)
          ? await agentsService.getByNumericId(value)
          : await agentsService.getByCacId(value)

        this.selectedAgent = normalizeSingleResponse(payload)
        return this.selectedAgent
      } catch (error) {
        this.error = errorMessage(error, 'Agent CAC introuvable.')
        throw error
      } finally {
        this.loadingDetails = false
      }
    },

    async fetchAgentsBySite(siteName, params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await agentsService.getBySite(siteName, {
          page: params.page || 1,
          limit: params.limit || params.limite || this.pagination.limite,
        })
        return this.applyList(payload)
      } catch (error) {
        this.error = errorMessage(error, 'Filtre par site impossible.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAgentsByFonction(fonction, params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await agentsService.getByFonction(fonction, {
          page: params.page || 1,
          limit: params.limit || params.limite || this.pagination.limite,
        })
        return this.applyList(payload)
      } catch (error) {
        this.error = errorMessage(error, 'Filtre par fonction impossible.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      this.loadingStats = true
      this.error = ''

      try {
        const payload = await agentsService.statistiques()
        this.stats = normalizeStats(payload)
        return this.stats
      } catch (error) {
        this.error = errorMessage(error, 'Impossible de charger les statistiques agents.')
        throw error
      } finally {
        this.loadingStats = false
      }
    },
  },
})
