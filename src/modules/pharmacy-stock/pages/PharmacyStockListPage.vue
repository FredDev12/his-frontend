<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import StockSummaryCards from '@/modules/pharmacy-stock/components/StockSummaryCards.vue'
import StockSearchBar from '@/modules/pharmacy-stock/components/StockSearchBar.vue'
import StockProductTable from '@/modules/pharmacy-stock/components/StockProductTable.vue'
import StockMovementDialog from '@/modules/pharmacy-stock/components/StockMovementDialog.vue'

import { usePharmacyStockStore } from '@/modules/pharmacy-stock/stores/pharmacy-stock.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = usePharmacyStockStore()
const toast = useToastStore()

const selectedProduct = ref(null)
const movementType = ref('IN')
const movementOpen = ref(false)
const removeOpen = ref(false)
const productToRemove = ref(null)

const totalLabel = computed(() => `${store.pagination.total || 0} produit(s)`)

onMounted(() => {
  loadProducts({ page: 1 })
})

async function loadProducts(params = {}) {
  try {
    await store.fetchProducts({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    toast.error(error.message || 'Impossible de charger le stock.')
  }
}

async function goToPage(page) {
  await loadProducts({ page, limit: store.pagination.limite })
}

async function search(filters) {
  await store.searchProducts(filters)
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
    categorie: '',
    stock_state: '',
  }

  await loadProducts({ page: 1 })
}

function openMovement(product, type) {
  selectedProduct.value = product
  movementType.value = type
  movementOpen.value = true
}

function closeMovement() {
  selectedProduct.value = null
  movementOpen.value = false
}

async function confirmMovement(payload) {
  if (!selectedProduct.value?.id) return

  await store.moveStock(selectedProduct.value, payload)
  closeMovement()
  await loadProducts({ page: store.pagination.page })
}

function askRemove(product) {
  productToRemove.value = product
  removeOpen.value = true
}

function closeRemove() {
  productToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!productToRemove.value?.id) return

  await store.removeProduct(productToRemove.value.id)
  closeRemove()
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Stock pharmacie</h1>

        <p class="his-page-subtitle">
          Gestion des médicaments, quantités, seuils d’alerte et mouvements de stock.
        </p>
      </div>

      <RouterLink to="/stock-pharmacie/create">
        <BaseButton> Nouveau produit </BaseButton>
      </RouterLink>
    </header>

    <StockSummaryCards :store="store" />

    <BaseCard>
      <StockSearchBar
        :filters="store.filters"
        :loading="store.searching"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <StockProductTable
        :products="store.products"
        :loading="store.loading"
        @stock-in="(product) => openMovement(product, 'IN')"
        @stock-out="(product) => openMovement(product, 'OUT')"
        @adjust="(product) => openMovement(product, 'ADJUST')"
        @remove="askRemove"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || store.pagination.page <= 1"
            @click="goToPage(store.pagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasNext"
            @click="goToPage(store.pagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <StockMovementDialog
      :open="movementOpen"
      :product="selectedProduct"
      :type="movementType"
      :loading="store.moving"
      @cancel="closeMovement"
      @confirm="confirmMovement"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer ce produit"
      :message="`Cette action va supprimer ${productToRemove?.nom || ''} du référentiel local. Préférer l’inactivation si le produit a déjà des mouvements.`"
      confirm-label="Supprimer produit"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>
