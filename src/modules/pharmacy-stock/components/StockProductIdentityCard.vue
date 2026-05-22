<script setup>
import StockStatusBadge from '@/modules/pharmacy-stock/components/StockStatusBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

function formatMoney(product) {
  return `${Number(product.prix_unitaire || 0).toLocaleString('fr-FR')} ${product.devise || 'CDF'}`
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ product.nom }}
          </h2>

          <StockStatusBadge :product="product" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Code {{ product.code }} · {{ product.categorie || '—' }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Stock : {{ product.quantite }} {{ product.unite }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Prix unitaire</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ formatMoney(product) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Seuil alerte</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ product.seuil_alerte }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Fournisseur</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ product.fournisseur || '—' }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Modifié le</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(product.updated_at) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
