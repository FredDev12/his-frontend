<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import StockStatusBadge from '@/modules/pharmacy-stock/components/StockStatusBadge.vue'

defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['stock-in', 'stock-out', 'adjust', 'remove'])

function formatMoney(product) {
  return `${Number(product.prix_unitaire || 0).toLocaleString('fr-FR')} ${product.devise || 'CDF'}`
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Produit
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Catégorie
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Stock
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Prix
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Statut
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement du stock...
            </td>
          </tr>

          <tr v-else-if="products.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun produit trouvé.
            </td>
          </tr>

          <tr v-for="product in products" v-else :key="product.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">{{ product.nom }}</p>
              <p class="mt-1 text-xs text-slate-500">Code : {{ product.code }}</p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ product.categorie || '—' }}
            </td>

            <td class="px-4 py-4">
              <p class="font-semibold text-slate-950">{{ product.quantite }} {{ product.unite }}</p>
              <p class="mt-1 text-xs text-slate-500">Seuil : {{ product.seuil_alerte }}</p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ formatMoney(product) }}
            </td>

            <td class="px-4 py-4">
              <StockStatusBadge :product="product" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/stock-pharmacie/${product.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>

                <RouterLink :to="`/stock-pharmacie/${product.id}/edit`">
                  <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
                </RouterLink>

                <BaseButton variant="success" size="sm" @click="$emit('stock-in', product)">
                  Entrée
                </BaseButton>

                <BaseButton variant="warning" size="sm" @click="$emit('stock-out', product)">
                  Sortie
                </BaseButton>

                <BaseButton variant="primary" size="sm" @click="$emit('adjust', product)">
                  Ajuster
                </BaseButton>

                <BaseButton variant="danger" size="sm" @click="$emit('remove', product)">
                  Supprimer
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
