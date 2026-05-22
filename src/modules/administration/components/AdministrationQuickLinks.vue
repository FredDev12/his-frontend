<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/ui/base/BaseButton.vue'

const links = [
  {
    label: 'Utilisateurs',
    description: 'Gérer les comptes système et rôles de base.',
    to: '/users',
    variant: 'primary',
  },
  {
    label: 'Services',
    description: 'Référentiel des services hospitaliers.',
    to: '/services',
    variant: 'secondary',
  },
  {
    label: 'Audit',
    description: 'Consulter l’historique des actions sensibles.',
    to: '/audit',
    variant: 'secondary',
  },
  {
    label: 'Paramètres',
    description: 'Configuration générale du HIS.',
    to: '/settings',
    variant: 'secondary',
  },
  {
    label: 'Rapports',
    description: 'Statistiques et pilotage décisionnel.',
    to: '/reports',
    variant: 'secondary',
  },
  {
    label: 'Notifications',
    description: 'Centre de notifications et alertes HIS.',
    to: '/notifications',
    variant: 'secondary',
  },
]
</script>

<template>
  <section class="his-card p-5">
    <div>
      <h2 class="font-semibold text-slate-950">Actions d’administration</h2>

      <p class="mt-1 text-sm text-slate-500">Accès rapide aux modules sensibles de supervision.</p>
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm"
      >
        <p class="font-semibold text-slate-950">
          {{ link.label }}
        </p>

        <p class="mt-1 min-h-10 text-sm text-slate-500">
          {{ link.description }}
        </p>

        <div class="mt-4">
          <BaseButton :variant="link.variant" size="sm"> Ouvrir </BaseButton>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
