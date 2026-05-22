<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import UserRoleBadge from '@/modules/users/components/UserRoleBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['reset-password', 'remove'])

function fullName(user) {
  return [user.nom, user.prenom].filter(Boolean).join(' ') || '—'
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
              Utilisateur
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Email
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Rôle
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Création
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
            <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des utilisateurs...
            </td>
          </tr>

          <tr v-else-if="users.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun utilisateur trouvé.
            </td>
          </tr>

          <tr v-for="user in users" v-else :key="user.id" class="hover:bg-slate-50">
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(user) }}
              </p>

              <p class="mt-1 text-xs text-slate-500">ID : {{ user.id }}</p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ user.email }}
            </td>

            <td class="px-4 py-4">
              <UserRoleBadge :role="user.role" />
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ formatDateTime(user.created_at) }}
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/users/${user.id}`">
                  <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
                </RouterLink>

                <RouterLink :to="`/users/${user.id}/edit`">
                  <BaseButton variant="secondary" size="sm"> Modifier </BaseButton>
                </RouterLink>

                <BaseButton variant="warning" size="sm" @click="$emit('reset-password', user)">
                  Mot de passe
                </BaseButton>

                <BaseButton variant="danger" size="sm" @click="$emit('remove', user)">
                  Supprimer
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        Chargement des utilisateurs...
      </div>

      <div
        v-else-if="users.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucun utilisateur trouvé.
      </div>

      <article
        v-for="user in users"
        v-else
        :key="user.id"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ fullName(user) }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{ user.email }}
            </p>
          </div>

          <UserRoleBadge :role="user.role" />
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="`/users/${user.id}`">
            <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
          </RouterLink>

          <RouterLink :to="`/users/${user.id}/edit`">
            <BaseButton variant="secondary" size="sm"> Modifier </BaseButton>
          </RouterLink>

          <BaseButton variant="warning" size="sm" @click="$emit('reset-password', user)">
            Mot de passe
          </BaseButton>

          <BaseButton variant="danger" size="sm" @click="$emit('remove', user)">
            Supprimer
          </BaseButton>
        </div>
      </article>
    </div>
  </div>
</template>
