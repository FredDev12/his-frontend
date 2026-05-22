import { defineStore } from 'pinia'
import { agentsService } from '@/modules/agents/services/agents.service'

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }

  return fallback
}

function parseChildren(value) {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .map((child) => ({
        nom: pick(child, ['nom', 'name'], ''),
        sexe: pick(child, ['sexe', 'gender'], ''),
      }))
      .filter((child) => child.nom || child.sexe)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parseChildren(parsed)
    } catch {
      return value
        .split(',')
        .map((name) => ({
          nom: name.trim(),
          sexe: '',
        }))
        .filter((child) => child.nom)
    }
  }

  return []
}

function formatSexe(value) {
  const sexe = String(value || '').toUpperCase()

  if (sexe === 'M') return 'Masculin'
  if (sexe === 'F') return 'Féminin'

  return value || ''
}

function normalizeAgent(item) {
  if (!item) return null

  const raw = item

  const cacId = pick(raw, ['cac_id_co', 'cacId', 'cac_id', 'matricule'], '')
  const id = pick(raw, ['id', '_id', 'agent_id', 'agentId'], cacId)

  return {
    raw,

    id,
    cac_id_co: cacId,

    nom_post: pick(raw, ['nom_post', 'nomPost', 'nom', 'name'], ''),
    prenom: pick(raw, ['prenom', 'prénom', 'firstName'], ''),

    sexe: pick(raw, ['sexe', 'gender'], ''),
    grand: pick(raw, ['grand'], ''),
    fonction: pick(raw, ['fonction', 'poste', 'role'], ''),
    nationalite: pick(raw, ['nationalite', 'nationalité'], ''),
    site: pick(raw, ['site', 'localite', 'localité'], ''),
    adresse: pick(raw, ['adresse', 'address'], ''),
    telephone: pick(raw, ['telephone', 'téléphone', 'phone'], ''),

    statut_marital: pick(raw, ['statut_marital', 'statutMarital'], ''),
    nom_conjoint: pick(raw, ['nom_conjoint', 'nomConjoint'], ''),
    nbre_enfa: pick(raw, ['nbre_enfa', 'nbreEnfa', 'nombre_enfants'], ''),
    nom_enfant: pick(raw, ['nom_enfant', 'nomEnfant'], ''),
    enfants: parseChildren(pick(raw, ['nom_enfant', 'nomEnfant'], '')).map((child) => ({
      ...child,
      sexe_label: formatSexe(child.sexe),
    })),

    date_de_naissance: pick(raw, ['date_de_naissance', 'dateNaissance', 'birthDate'], ''),
    parents: pick(raw, ['parents'], ''),
    statutparents: pick(raw, ['statutparents', 'statut_parents'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.data ||
    payload?.agents ||
    payload?.items ||
    payload?.results ||
    payload?.resultats ||
    []

  const items = Array.isArray(rawItems) ? rawItems.map(normalizeAgent).filter(Boolean) : []

  const pagination = payload?.pagination || payload?.meta || {}

  const page = Number(payload?.page || pagination.page || 1)

  const limite = Number(
    payload?.limit || payload?.limite || pagination.limit || pagination.limite || 100,
  )

  const total = Number(payload?.total || payload?.count || pagination.total || items.length || 0)

  const totalPages = Number(
    payload?.pages ||
      payload?.totalPages ||
      pagination.pages ||
      pagination.totalPages ||
      Math.ceil(total / limite) ||
      1,
  )

  return {
    items,
    total,
    page,
    limite,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  const agent = payload?.agent || payload?.data || payload?.result || payload

  return normalizeAgent(agent)
}

function normalizeStats(payload) {
  const data = payload?.data || payload?.statistiques || payload?.stats || payload || {}

  return {
    raw: data,
    total: Number(data.total || data.totalAgents || data.count || 0) || 0,
    par_sexe: data.par_sexe || data.sexe || data.bySexe || {},
    par_site: data.par_site || data.site || data.bySite || {},
    par_fonction: data.par_fonction || data.fonction || data.byFonction || {},
    par_statut: data.par_statut || data.statut || data.byStatut || {},
  }
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
    async fetchAgents(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await agentsService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

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
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Impossible de charger les agents CAC.'

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
        const hasFonction = String(this.filters.fonction || '').trim()

        const hasAdvancedFilter = [
          this.filters.cac_id_co,
          this.filters.nom_post,
          this.filters.prenom,
          this.filters.site,
          this.filters.telephone,
        ].some((value) => String(value || '').trim())

        let payload

        if (hasFonction && !hasAdvancedFilter) {
          payload = await agentsService.getByFonction(this.filters.fonction, {
            page: 1,
            limit: this.pagination.limite,
          })
        } else if (hasAdvancedFilter) {
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
          payload = await agentsService.list({
            page: 1,
            limit: this.pagination.limite,
          })
        }

        const normalized = normalizeListResponse(payload)

        let items = normalized.items

        if (hasFonction && hasAdvancedFilter) {
          const fonction = String(this.filters.fonction).toLowerCase().trim()

          items = items.filter((agent) =>
            String(agent.fonction || '')
              .toLowerCase()
              .includes(fonction),
          )
        }

        this.agents = items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: hasFonction && hasAdvancedFilter ? items.length : normalized.total,
          hasNext: hasFonction && hasAdvancedFilter ? false : normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return {
          ...normalized,
          items,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche agent impossible.'

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
        const isNumeric = /^\d+$/.test(value)

        const payload = isNumeric
          ? await agentsService.getByNumericId(value)
          : await agentsService.getByCacId(value)

        this.selectedAgent = normalizeSingleResponse(payload)

        return this.selectedAgent
      } catch (error) {
        this.error =
          error.response?.data?.message || error.response?.data?.error || 'Agent CAC introuvable.'

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
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Filtre par site impossible.'

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
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Filtre par fonction impossible.'

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
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Impossible de charger les statistiques agents.'

        throw error
      } finally {
        this.loadingStats = false
      }
    },
  },
})
