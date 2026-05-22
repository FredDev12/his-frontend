<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import ServiceStatusBadge from '@/modules/services/components/ServiceStatusBadge.vue'

defineProps({
  services: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['activate', 'deactivate', 'remove'])

function formatMoney(service) {
  return `${Number(service.prix_base || 0).toLocaleString('fr-FR')} ${service.devise || 'CDF'}`
}

function moduleLabel(value) {
  const labels = {
    reception: 'Réception',
    consultations: 'Consultations',
    laboratoire: 'Laboratoire',
    imagerie: 'Imagerie',
    pharmacie: 'Pharmacie',
    caisse: 'Caisse',
    facturation: 'Facturation',
    sorties: 'Sorties',
    autre: 'Autre',
  }

  return labels[value] || value || '—'
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
              Service
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Module
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Prix
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Remise
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Visibilité
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
            <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des services...
            </td>
          </tr>

          <tr v-else-if="services.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun service trouvé.
            </td>
          </tr>

          <tr v-for="service in services" v-else :key="service.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">{{ service.nom }}</p>
              <p class="mt-1 text-xs text-slate-500">Code : {{ service.code }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ service.categorie }}</p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ moduleLabel(service.module_source) }}
            </td>

            <td class="px-4 py-4">
              <p class="font-semibold text-slate-950">
                {{ formatMoney(service) }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                {{ service.necessite_paiement ? 'Paiement requis' : 'Sans paiement' }}
              </p>
            </td>

            <td class="px-4 py-4">
              <BaseBadge :variant="service.remise_autorisee ? 'success' : 'neutral'">
                {{ service.remise_autorisee ? `${service.remise_max}% max` : 'Non autorisée' }}
              </BaseBadge>
            </td>

            <td class="px-4 py-4">
              <div class="flex flex-wrap gap-1">
                <BaseBadge v-if="service.visible_dans_facturation" variant="primary">
                  Facturation
                </BaseBadge>

                <BaseBadge v-if="service.visible_dans_reception" variant="secondary">
                  Réception
                </BaseBadge>

                <BaseBadge
                  v-if="!service.visible_dans_facturation && !service.visible_dans_reception"
                  variant="neutral"
                >
                  Interne
                </BaseBadge>
              </div>
            </td>

            <td class="px-4 py-4">
              <ServiceStatusBadge :statut="service.statut" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/services/${service.id}`">
                  <BaseButton variant="secondary" size="sm">Voir</BaseButton>
                </RouterLink>

                <RouterLink :to="`/services/${service.id}/edit`">
                  <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
                </RouterLink>

                <BaseButton
                  v-if="service.statut !== 'active'"
                  variant="success"
                  size="sm"
                  @click="$emit('activate', service)"
                >
                  Activer
                </BaseButton>

                <BaseButton
                  v-if="service.statut === 'active'"
                  variant="warning"
                  size="sm"
                  @click="$emit('deactivate', service)"
                >
                  Désactiver
                </BaseButton>

                <BaseButton variant="danger" size="sm" @click="$emit('remove', service)">
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
