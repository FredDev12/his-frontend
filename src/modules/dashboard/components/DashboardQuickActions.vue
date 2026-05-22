<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/ui/base/BaseButton.vue'

const actions = [
  {
    label: 'Nouveau patient',
    description: 'Créer un dossier patient',
    to: '/patients/create',
    variant: 'primary',
  },
  {
    label: 'Nouvelle réception',
    description: 'Enregistrer une admission',
    to: '/receptions/create',
    variant: 'primary',
  },
  {
    label: 'Triage urgent',
    description: 'Créer une évaluation triage',
    to: '/triage/create',
    variant: 'emergency',
  },
  {
    label: 'Nouvelle consultation',
    description: 'Créer une consultation',
    to: '/consultations/create',
    variant: 'primary',
  },
  {
    label: 'Paiement',
    description: 'Créer un paiement caisse',
    to: '/caisse/create',
    variant: 'success',
  },
  {
    label: 'Rapports',
    description: 'Voir les statistiques',
    to: '/reports',
    variant: 'secondary',
  },
]
</script>

<template>
  <section class="his-card p-5">
    <div>
      <h2 class="font-semibold text-slate-950">Accès rapides</h2>

      <p class="mt-1 text-sm text-slate-500">Actions fréquentes du workflow hospitalier.</p>
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <RouterLink
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm"
      >
        <p class="font-semibold text-slate-950">
          {{ action.label }}
        </p>

        <p class="mt-1 text-sm text-slate-500">
          {{ action.description }}
        </p>

        <div class="mt-4">
          <BaseButton :variant="action.variant" size="sm"> Ouvrir </BaseButton>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
