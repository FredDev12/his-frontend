<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const route = useRoute()

const title = computed(() => route.meta.title || 'Module')
const description = computed(() => route.meta.description || 'Module métier du système hospitalier.')
const actions = computed(() => route.meta.actions || [])

const cards = computed(() => [
  {
    label: 'Total',
    value: '0',
    description: 'Données à connecter à l’API',
  },
  {
    label: 'Aujourd’hui',
    value: '0',
    description: 'Activité du jour',
  },
  {
    label: 'En attente',
    value: '0',
    description: 'Éléments à traiter',
  },
])
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="his-page-title">
            {{ title }}
          </h1>

          <BaseBadge variant="primary">
            Module
          </BaseBadge>
        </div>

        <p class="his-page-subtitle">
          {{ description }}
        </p>
      </div>

      <div v-if="actions.length" class="flex flex-wrap gap-2">
        <BaseButton
          v-for="(action, index) in actions"
          :key="action"
          :variant="index === 0 ? 'primary' : 'secondary'"
        >
          {{ action }}
        </BaseButton>
      </div>
    </header>

    <section class="grid gap-4 md:grid-cols-3">
      <BaseCard v-for="card in cards" :key="card.label">
        <p class="text-sm font-medium text-slate-500">
          {{ card.label }}
        </p>

        <p class="mt-3 text-3xl font-semibold text-slate-950">
          {{ card.value }}
        </p>

        <p class="mt-2 text-sm text-slate-500">
          {{ card.description }}
        </p>
      </BaseCard>
    </section>

    <BaseCard
      title="Espace de travail"
      subtitle="Cette page sera remplacée progressivement par la vraie interface métier du module."
    >
      <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p class="text-sm font-semibold text-slate-800">
          Module prêt à intégrer
        </p>

        <p class="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          La structure, le layout, les boutons, les cartes et la navigation sont déjà uniformisés.
          La prochaine étape consiste à connecter les données API et créer les formulaires métier.
        </p>
      </div>
    </BaseCard>
  </div>
</template>