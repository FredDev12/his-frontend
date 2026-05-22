import { defineStore } from 'pinia'
import { servicesService } from '@/modules/services/services/services.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'

function toBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function normalizeService(item) {
  if (!item) return null

  return {
    raw: item,

    id: item.id,
    code: item.code || '',
    nom: item.nom || '',
    categorie: item.categorie || '',
    module_source: item.module_source || item.moduleSource || 'autre',

    prix_base: Number(item.prix_base ?? item.prixBase ?? item.price ?? 0),
    devise: item.devise || item.currency || 'CDF',

    remise_autorisee: toBoolean(item.remise_autorisee ?? item.remiseAutorisee),
    remise_max: Number(item.remise_max ?? item.remiseMax ?? 0),

    necessite_paiement: toBoolean(item.necessite_paiement ?? item.necessitePaiement),

    visible_dans_facturation: toBoolean(
      item.visible_dans_facturation ?? item.visibleDansFacturation,
    ),

    visible_dans_reception: toBoolean(item.visible_dans_reception ?? item.visibleDansReception),

    statut: item.statut || item.status || 'active',
    ordre: Number(item.ordre ?? item.order ?? 0),
    description: item.description || '',

    created_at: item.created_at || item.createdAt || '',
    updated_at: item.updated_at || item.updatedAt || '',
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.data || payload?.items || []
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeService).filter(Boolean) : []

  const pagination = payload?.pagination || {}

  const page = Number(pagination.page || 1)
  const limite = Number(pagination.limit || pagination.limite || 10)
  const total = Number(pagination.total || items.length || 0)
  const pages = Number(pagination.pages || Math.ceil(total / limite) || 1)

  return {
    items,
    total,
    page,
    limite,
    hasNext: page < pages,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  return normalizeService(payload?.data || payload?.service || payload)
}

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [],
    selectedService: null,

    loading: false,
    loadingDetails: false,
    saving: false,
    deleting: false,
    searching: false,
    calculating: false,

    error: '',

    pagination: {
      page: 1,
      limite: 10,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    filters: {
      q: '',
      statut: '',
      categorie: '',
      module_source: '',
      visible_dans_facturation: '',
      visible_dans_reception: '',
    },

    pricingPreview: null,
  }),

  getters: {
    totalServices: (state) => state.pagination.total || state.services.length,
    activeCount: (state) => state.services.filter((item) => item.statut === 'active').length,
    inactiveCount: (state) => state.services.filter((item) => item.statut !== 'active').length,
    payableCount: (state) => state.services.filter((item) => item.necessite_paiement).length,
    facturableCount: (state) =>
      state.services.filter((item) => item.visible_dans_facturation).length,
  },

  actions: {
    async fetchServices(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await servicesService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.services = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Impossible de charger les services.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchServices(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
        categorie: filters.categorie ?? '',
        module_source: filters.module_source ?? '',
        visible_dans_facturation: filters.visible_dans_facturation ?? '',
        visible_dans_reception: filters.visible_dans_reception ?? '',
      }

      try {
        const payload = await servicesService.search({
          ...this.filters,
          page: 1,
          limit: this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.services = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Recherche service impossible.'
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchServiceById(id) {
      this.loadingDetails = true
      this.error = ''
      this.selectedService = null

      try {
        const payload = await servicesService.getById(id)
        this.selectedService = normalizeSingleResponse(payload)

        return this.selectedService
      } catch (error) {
        this.error = error.message || 'Service introuvable.'
        throw error
      } finally {
        this.loadingDetails = false
      }
    },

    async createService(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await servicesService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Service créé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SERVICES,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            action: 'SERVICE_CREATED',
            message: 'Service/module administrable créé',
            service_code: created?.code,
            service_name: created?.nom,
            module_source: created?.module_source,
            prix_base: created?.prix_base,
            devise: created?.devise,
          },
        })

        return created
      } catch (error) {
        const message = error.message || 'Création du service impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateService(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await servicesService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        this.selectedService = updated

        this.services = this.services.map((service) =>
          String(service.id) === String(id) ? updated : service,
        )

        toast.success('Service mis à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SERVICES,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            action: 'SERVICE_UPDATED',
            message: 'Service/module administrable mis à jour',
            service_code: updated?.code,
            service_name: updated?.nom,
            module_source: updated?.module_source,
            prix_base: updated?.prix_base,
            devise: updated?.devise,
          },
        })

        return updated
      } catch (error) {
        const message = error.message || 'Modification du service impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async activateService(service) {
      const toast = useToastStore()
      this.saving = true

      try {
        const response = await servicesService.activate(service.id)
        const updated = normalizeSingleResponse(response)

        this.services = this.services.map((item) =>
          String(item.id) === String(service.id) ? updated : item,
        )

        if (this.selectedService?.id === service.id) {
          this.selectedService = updated
        }

        toast.success('Service activé.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SERVICES,
          id: service.id,
          status: HIS_STATUSES.SERVICE_ACTIVATED,
          details: {
            action: 'SERVICE_ACTIVATED',
            message: 'Service/module activé',
            service_code: updated?.code,
            service_name: updated?.nom,
          },
        })

        return updated
      } finally {
        this.saving = false
      }
    },

    async deactivateService(service) {
      const toast = useToastStore()
      this.saving = true

      try {
        const response = await servicesService.deactivate(service.id)
        const updated = normalizeSingleResponse(response)

        this.services = this.services.map((item) =>
          String(item.id) === String(service.id) ? updated : item,
        )

        if (this.selectedService?.id === service.id) {
          this.selectedService = updated
        }

        toast.success('Service désactivé.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SERVICES,
          id: service.id,
          status: HIS_STATUSES.SERVICE_DEACTIVATED,
          details: {
            action: 'SERVICE_DEACTIVATED',
            message: 'Service/module désactivé',
            service_code: updated?.code,
            service_name: updated?.nom,
          },
        })

        return updated
      } finally {
        this.saving = false
      }
    },

    async removeService(id) {
      const toast = useToastStore()
      this.deleting = true

      try {
        await servicesService.remove(id)

        this.services = this.services.filter((item) => String(item.id) !== String(id))

        toast.success('Service supprimé.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.SERVICES,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'SERVICE_DELETED',
            message: 'Service/module supprimé',
          },
        })
      } finally {
        this.deleting = false
      }
    },

    async calculatePrice(id, remise = 0) {
      this.calculating = true
      this.error = ''
      this.pricingPreview = null

      try {
        const response = await servicesService.calculatePrice(id, remise)
        this.pricingPreview = response.data

        return this.pricingPreview
      } catch (error) {
        this.error = error.message || 'Calcul de prix impossible.'
        throw error
      } finally {
        this.calculating = false
      }
    },
  },
})

export const useHospitalServicesStore = useServicesStore
