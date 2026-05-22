<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import StockProductForm from '@/modules/pharmacy-stock/components/StockProductForm.vue'
import { usePharmacyStockStore } from '@/modules/pharmacy-stock/stores/pharmacy-stock.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = usePharmacyStockStore()
const toast = useToastStore()

const serverError = ref('')
const productId = computed(() => route.params.id)
const product = computed(() => store.selectedProduct)

onMounted(async () => {
  try {
    await store.fetchProductById(productId.value)
  } catch {
    router.push('/stock-pharmacie')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateProduct(productId.value, payload)
    router.push(`/stock-pharmacie/${productId.value}`)
  } catch (error) {
    serverError.value = error.message || 'Modification produit impossible.'
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/stock-pharmacie/${productId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier produit stock</h1>
      <p class="his-page-subtitle">Modification contrôlée du produit pharmacie.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du produit...
    </div>

    <StockProductForm
      v-else-if="product"
      :initial-value="product"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
