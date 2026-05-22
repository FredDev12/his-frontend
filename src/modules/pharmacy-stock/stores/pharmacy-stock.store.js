import { defineStore } from 'pinia'
import { pharmacyStockService } from '@/modules/pharmacy-stock/services/pharmacy-stock.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'

function normalizeProduct(item) {
  if (!item) return null

  const quantite = Number(item.quantite || 0)
  const seuil = Number(item.seuil_alerte || 0)

  return {
    raw: item,
    id: item.id,
    code: item.code || '',
    nom: item.nom || '',
    categorie: item.categorie || '',
    forme: item.forme || '',
    unite: item.unite || 'unité',
    quantite,
    seuil_alerte: seuil,
    prix_unitaire: Number(item.prix_unitaire || 0),
    devise: item.devise || 'CDF',
    fournisseur: item.fournisseur || '',
    emplacement: item.emplacement || '',
    statut: item.statut || 'active',
    description: item.description || '',
    stock_state: quantite <= 0 ? 'out' : quantite <= seuil ? 'low' : 'ok',
    created_at: item.created_at || '',
    updated_at: item.updated_at || '',
  }
}

function normalizeMovement(item) {
  if (!item) return null

  return {
    raw: item,
    id: item.id,
    product_id: item.product_id,
    product_code: item.product_code || '',
    product_name: item.product_name || '',
    type: item.type || 'IN',
    quantity: Number(item.quantity || 0),
    stock_after: Number(item.stock_after || 0),
    reason: item.reason || '',
    created_at: item.created_at || '',
  }
}

function normalizeListResponse(payload) {
  const rawItems = payload?.data || payload?.items || []
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeProduct).filter(Boolean) : []

  const pagination = payload?.pagination || {}
  const page = Number(pagination.page || 1)
  const limite = Number(pagination.limit || pagination.limite || 10)
  const total = Number(pagination.total || items.length || 0)
  const totalPages = Number(pagination.pages || Math.ceil(total / limite) || 1)

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
  return normalizeProduct(payload?.data || payload?.product || payload)
}

export const usePharmacyStockStore = defineStore('pharmacyStock', {
  state: () => ({
    products: [],
    selectedProduct: null,
    movements: [],

    loading: false,
    loadingDetails: false,
    loadingMovements: false,
    saving: false,
    deleting: false,
    searching: false,
    moving: false,

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
      stock_state: '',
    },
  }),

  getters: {
    lowStockCount: (state) => state.products.filter((item) => item.stock_state === 'low').length,
    outStockCount: (state) => state.products.filter((item) => item.stock_state === 'out').length,
    totalProducts: (state) => state.pagination.total || state.products.length,
    totalStockValue: (state) =>
      state.products.reduce(
        (sum, item) => sum + Number(item.quantite || 0) * Number(item.prix_unitaire || 0),
        0,
      ),
  },

  actions: {
    async fetchProducts(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await pharmacyStockService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.products = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Impossible de charger le stock pharmacie.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchProducts(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        q: filters.q ?? '',
        statut: filters.statut ?? '',
        categorie: filters.categorie ?? '',
        stock_state: filters.stock_state ?? '',
      }

      try {
        const payload = await pharmacyStockService.search({
          ...this.filters,
          page: 1,
          limit: this.pagination.limite,
        })

        const normalized = normalizeListResponse(payload)

        this.products = normalized.items
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Recherche produit impossible.'
        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchProductById(id) {
      this.loadingDetails = true
      this.error = ''
      this.selectedProduct = null

      try {
        const payload = await pharmacyStockService.getById(id)
        this.selectedProduct = normalizeSingleResponse(payload)

        return this.selectedProduct
      } catch (error) {
        this.error = error.message || 'Produit introuvable.'
        throw error
      } finally {
        this.loadingDetails = false
      }
    },

    async fetchMovements(productId = null) {
      this.loadingMovements = true

      try {
        const payload = await pharmacyStockService.movements(productId)
        const rawItems = payload?.data || []

        this.movements = Array.isArray(rawItems)
          ? rawItems.map(normalizeMovement).filter(Boolean)
          : []

        return this.movements
      } finally {
        this.loadingMovements = false
      }
    },

    async createProduct(payload) {
      const toast = useToastStore()
      this.saving = true
      this.error = ''

      try {
        const response = await pharmacyStockService.create(payload)
        const created = normalizeSingleResponse(response)

        toast.success('Produit ajouté au stock.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.STOCK_PHARMACIE,
          id: created?.id,
          status: HIS_STATUSES.CREATED,
          details: {
            action: 'STOCK_PRODUCT_CREATED',
            message: 'Produit stock créé',
            product_code: created?.code,
            product_name: created?.nom,
            quantity: created?.quantite,
          },
        })
        return created
      } catch (error) {
        const message = error.message || 'Création produit impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateProduct(id, payload) {
      const toast = useToastStore()
      this.saving = true
      this.error = ''

      try {
        const response = await pharmacyStockService.update(id, payload)
        const updated = normalizeSingleResponse(response)

        this.selectedProduct = updated
        toast.success('Produit mis à jour.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.STOCK_PHARMACIE,
          id: updated?.id || id,
          status: HIS_STATUSES.UPDATED,
          details: {
            action: 'STOCK_PRODUCT_UPDATED',
            message: 'Produit stock mis à jour',
            product_code: updated?.code,
            product_name: updated?.nom,
            quantity: updated?.quantite,
          },
        })
        return updated
      } catch (error) {
        const message = error.message || 'Modification produit impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },

    async moveStock(product, payload) {
      const toast = useToastStore()
      this.moving = true
      this.error = ''

      try {
        const response = await pharmacyStockService.moveStock(product.id, payload)
        const updated = normalizeSingleResponse(response)

        this.products = this.products.map((item) =>
          String(item.id) === String(product.id) ? updated : item,
        )

        if (this.selectedProduct && String(this.selectedProduct.id) === String(product.id)) {
          this.selectedProduct = updated
        }

        await this.fetchMovements(product.id)

        const labels = {
          IN: 'Entrée stock enregistrée.',
          OUT: 'Sortie stock enregistrée.',
          ADJUST: 'Ajustement stock enregistré.',
        }

        toast.success(labels[payload.type] || 'Mouvement stock enregistré.')

        const stockStatusMap = {
          IN: HIS_STATUSES.STOCK_IN,
          OUT: HIS_STATUSES.STOCK_OUT,
          ADJUST: HIS_STATUSES.STOCK_ADJUSTED,
        }

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.STOCK_PHARMACIE,
          id: product.id,
          status: stockStatusMap[payload.type] || HIS_STATUSES.UPDATED,
          details: {
            action: `STOCK_${payload.type}`,
            message: labels[payload.type] || 'Mouvement stock enregistré',
            product_code: updated?.code || product.code,
            product_name: updated?.nom || product.nom,
            quantity: payload.quantity,
            stock_after: updated?.quantite,
            reason: payload.reason,
          },
        })
        return updated
      } catch (error) {
        const message = error.message || 'Mouvement stock impossible.'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.moving = false
      }
    },

    async removeProduct(id) {
      const toast = useToastStore()
      this.deleting = true

      try {
        await pharmacyStockService.remove(id)
        this.products = this.products.filter((item) => String(item.id) !== String(id))
        toast.success('Produit supprimé.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.STOCK_PHARMACIE,
          id,
          status: HIS_STATUSES.DELETED,
          details: {
            action: 'STOCK_PRODUCT_DELETED',
            message: 'Produit stock supprimé',
          },
        })
      } finally {
        this.deleting = false
      }
    },
  },
})
