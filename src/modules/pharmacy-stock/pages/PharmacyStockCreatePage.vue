<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import StockProductForm from '@/modules/pharmacy-stock/components/StockProductForm.vue'
import { usePharmacyStockStore } from '@/modules/pharmacy-stock/stores/pharmacy-stock.store'
import { useToastStore } from '@/shared/stores/toast.store'

const router = useRouter()
const store = usePharmacyStockStore()
const toast = useToastStore()
const serverError = ref('')

async function submit(payload) {
  serverError.value = ''

  try {
    const created = await store.createProduct(payload)

    if (created?.id) {
      router.push(`/stock-pharmacie/${created.id}`)
      return
    }

    router.push('/stock-pharmacie')
  } catch (error) {
    serverError.value = error.message || 'Création produit impossible.'
    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/stock-pharmacie')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouveau produit stock</h1>
      <p class="his-page-subtitle">Ajouter un médicament ou consommable au stock pharmacie.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <StockProductForm
      submit-label="Créer produit"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
