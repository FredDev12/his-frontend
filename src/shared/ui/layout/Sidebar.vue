<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const auth = useAuthStore()

const menuGroups = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Tableau de bord',
        to: '/dashboard',
        roles: ['admin', 'direction', 'medecin', 'secretaire', 'infirmier', 'caissier'],
      },
      {
        label: 'Patients',
        to: '/patients',
        roles: ['admin', 'medecin', 'secretaire', 'infirmier'],
      },
      { label: 'Réception', to: '/receptions', roles: ['admin', 'secretaire'] },
      { label: 'Rendez-vous', to: '/rendez-vous', roles: ['admin', 'secretaire', 'medecin'] },
    ],
  },
  {
    title: 'Clinique',
    items: [
      { label: 'Triage / Urgences', to: '/triage', roles: ['admin', 'infirmier', 'medecin'] },
      { label: 'Consultations', to: '/consultations', roles: ['admin', 'medecin'] },
      { label: 'Laboratoire', to: '/laboratoire', roles: ['admin', 'laborantin', 'medecin'] },
      { label: 'Imagerie', to: '/imagerie', roles: ['admin', 'medecin'] },
      { label: 'Sorties', to: '/sorties', roles: ['admin', 'medecin', 'secretaire'] },
    ],
  },
  {
    title: 'Pharmacie & finances',
    items: [
      { label: 'Pharmacie', to: '/pharmacie', roles: ['admin', 'pharmacien', 'medecin'] },
      { label: 'Stock pharmacie', to: '/stock-pharmacie', roles: ['admin', 'pharmacien'] },
      { label: 'Caisse', to: '/caisse', roles: ['admin', 'caissier'] },
      { label: 'Facturation', to: '/facturation', roles: ['admin', 'caissier'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Agents CAC', to: '/agents', roles: ['admin', 'direction'] },
      { label: 'Utilisateurs', to: '/users', roles: ['admin'] },
      { label: 'Services', to: '/services', roles: ['admin'] },
      { label: 'Rapports', to: '/reports', roles: ['admin', 'medecin', 'secretaire'] },
      { label: 'Notifications', to: '/notifications', roles: ['admin', 'medecin', 'secretaire'] },
      { label: 'Audit', to: '/audit', roles: ['admin', 'direction'] },
      { label: 'Console Admin', to: '/administration', roles: ['admin'] },
      { label: 'Paramètres', to: '/settings', roles: ['admin'] },
    ],
  },
]

const visibleGroups = computed(() => {
  return menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(auth.role)),
    }))
    .filter((group) => group.items.length > 0)
})
</script>

<template>
  <div>
    <div v-if="open" class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" @click="$emit('close')" />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <RouterLink to="/dashboard" class="flex items-center gap-3" @click="$emit('close')">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white"
          >
            HC
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-950">Hôpital CAC</p>
            <p class="text-xs text-slate-500">HIS Web</p>
          </div>
        </RouterLink>

        <button
          type="button"
          class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <section v-for="group in visibleGroups" :key="group.title">
          <p class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {{ group.title }}
          </p>

          <div class="space-y-1">
            <RouterLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="block rounded-xl px-3 py-2.5 text-sm font-medium transition"
              active-class="bg-blue-50 text-blue-700"
              inactive-class="text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              @click="$emit('close')"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </section>
      </nav>

      <div class="border-t border-slate-200 p-4">
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-sm font-medium text-slate-900">
            {{ auth.fullName }}
          </p>

          <p class="mt-1 text-xs capitalize text-slate-500">
            Rôle : {{ auth.role || 'non défini' }}
          </p>
        </div>
      </div>
    </aside>
  </div>
</template>
