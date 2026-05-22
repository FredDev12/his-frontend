<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import FactureIdentityCard from '@/modules/facturation/components/FactureIdentityCard.vue'

import { useFacturationStore } from '@/modules/facturation/stores/facturation.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useFacturationStore()
const toast = useToastStore()

const factureId = computed(() => route.params.id)
const facture = computed(() => store.selectedFacture)

onMounted(async () => {
  try {
    await store.fetchFactureById(factureId.value)
  } catch (error) {
    toast.error(error.message || 'Facture introuvable.')
    router.push('/facturation')
  }
})

function formatMoney(value, devise = 'CDF') {
  return `${Number(value || 0).toLocaleString('fr-FR')} ${devise}`
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail facture</h1>
        <p class="his-page-subtitle">Lignes facturées, total et statut financier.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/facturation">
          <BaseButton variant="secondary">Retour</BaseButton>
        </RouterLink>

        <RouterLink
          v-if="facture && facture.statut === 'draft'"
          :to="`/facturation/${facture.id}/edit`"
        >
          <BaseButton>Modifier</BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la facture...
    </div>

    <div v-else-if="facture" class="space-y-6">
      <FactureIdentityCard :facture="facture" />

      <BaseCard title="Lignes facture" subtitle="Détail des prestations facturées.">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Libellé
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Module
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Qté
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Prix
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Total
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr v-for="line in facture.lignes" :key="line.id">
                <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ line.libelle }}</td>
                <td class="px-4 py-4 text-sm text-slate-600">{{ line.module }}</td>
                <td class="px-4 py-4 text-sm text-slate-600">{{ line.quantite }}</td>
                <td class="px-4 py-4 text-sm text-slate-600">
                  {{ formatMoney(line.prix_unitaire, facture.devise) }}
                </td>
                <td class="px-4 py-4 text-sm font-semibold text-slate-950">
                  {{ formatMoney(line.total, facture.devise) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <BaseCard title="Notes" subtitle="Informations internes.">
        <p class="text-sm leading-6 text-slate-700">
          {{ facture.notes || '—' }}
        </p>
      </BaseCard>
    </div>
  </div>
</template>
