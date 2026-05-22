<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import StockProductIdentityCard from '@/modules/pharmacy-stock/components/StockProductIdentityCard.vue'
import StockMovementsTable from '@/modules/pharmacy-stock/components/StockMovementsTable.vue'
import StockMovementDialog from '@/modules/pharmacy-stock/components/StockMovementDialog.vue'

import { usePharmacyStockStore } from '@/modules/pharmacy-stock/stores/pharmacy-stock.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = usePharmacyStockStore()
const toast = useToastStore()

const productId = computed(() => route.params.id)
const product = computed(() => store.selectedProduct)

const movementOpen = ref(false)
const movementType = ref('IN')

onMounted(async () => {
  try {
    await store.fetchProductById(productId.value)
    await store.fetchMovements(productId.value)
  } catch (error) {
    toast.error(error.message || 'Produit introuvable.')
    router.push('/stock-pharmacie')
  }
})

function openMovement(type) {
  movementType.value = type
  movementOpen.value = true
}

function closeMovement() {
  movementOpen.value = false
}

async function confirmMovement(payload) {
  if (!product.value?.id) return

  await store.moveStock(product.value, payload)
  closeMovement()
  await store.fetchProductById(productId.value)
  await store.fetchMovements(productId.value)
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail produit stock</h1>
        <p class="his-page-subtitle">Informations produit, stock disponible et mouvements.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/stock-pharmacie">
          <BaseButton variant="secondary">Retour</BaseButton>
        </RouterLink>

        <BaseButton v-if="product" variant="success" @click="openMovement('IN')">Entrée</BaseButton>
        <BaseButton v-if="product" variant="warning" @click="openMovement('OUT')"
          >Sortie</BaseButton
        >
        <BaseButton v-if="product" variant="primary" @click="openMovement('ADJUST')"
          >Ajuster</BaseButton
        >

        <RouterLink v-if="product" :to="`/stock-pharmacie/${product.id}/edit`">
          <BaseButton>Modifier</BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du produit...
    </div>

    <div v-else-if="product" class="space-y-6">
      <StockProductIdentityCard :product="product" />

      <BaseCard title="Description" subtitle="Informations internes pharmacie.">
        <p class="text-sm leading-6 text-slate-700">
          {{ product.description || '—' }}
        </p>
      </BaseCard>

      <BaseCard title="Historique mouvements" subtitle="Entrées, sorties et ajustements de stock.">
        <StockMovementsTable :movements="store.movements" />
      </BaseCard>
    </div>

    <StockMovementDialog
      :open="movementOpen"
      :product="product"
      :type="movementType"
      :loading="store.moving"
      @cancel="closeMovement"
      @confirm="confirmMovement"
    />
  </div>
</template>
