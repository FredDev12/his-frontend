<script setup>
import { computed } from 'vue'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import ServiceStatusBadge from '@/modules/services/components/ServiceStatusBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
})

const modulesLies = computed(() => {
  const value =
    props.service.modules_lies || props.service.modules || props.service.modules_lies_ids || []

  return Array.isArray(value) ? value : []
})

const moduleSourceLabel = computed(() => {
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

  return labels[props.service.module_source] || props.service.module_source || '—'
})

function dash(value) {
  return value || '—'
}

function formatMoney(value, devise = 'CDF') {
  return `${Number(value || 0).toLocaleString('fr-FR')} ${devise}`
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ dash(service.nom) }}
          </h2>

          <ServiceStatusBadge :statut="service.statut" />

          <BaseBadge v-if="service.visible_dans_facturation" variant="primary">
            Facturation
          </BaseBadge>

          <BaseBadge v-if="service.visible_dans_reception" variant="secondary">
            Réception
          </BaseBadge>
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Code {{ dash(service.code) }} · Module {{ moduleSourceLabel }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créé le : {{ formatDateTime(service.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Catégorie</dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(service.categorie) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Prix de base</dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatMoney(service.prix_base, service.devise) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Remise</dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ service.remise_autorisee ? `${service.remise_max}% max` : 'Non autorisée' }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Modifié le</dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(service.updated_at) }}
        </dd>
      </div>
    </dl>

    <dl class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Paiement requis</dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ service.necessite_paiement ? 'Oui' : 'Non' }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">
          Visible facturation
        </dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ service.visible_dans_facturation ? 'Oui' : 'Non' }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">
          Visible réception
        </dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ service.visible_dans_reception ? 'Oui' : 'Non' }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Modules liés</dt>

        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ modulesLies.length }}
        </dd>
      </div>
    </dl>

    <div class="mt-6">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Modules liés</p>

      <div class="mt-3 flex flex-wrap gap-2">
        <BaseBadge v-for="module in modulesLies" :key="module" variant="neutral">
          {{ module }}
        </BaseBadge>

        <span v-if="modulesLies.length === 0" class="text-sm text-slate-500">
          Aucun module lié supplémentaire.
        </span>
      </div>
    </div>
  </section>
</template>
