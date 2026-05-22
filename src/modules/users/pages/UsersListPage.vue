<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import UserSearchBar from '@/modules/users/components/UserSearchBar.vue'
import UserTable from '@/modules/users/components/UserTable.vue'
import UserResetPasswordDialog from '@/modules/users/components/UserResetPasswordDialog.vue'

import { useUsersStore } from '@/modules/users/stores/users.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useUsersStore()
const toast = useToastStore()

const userToRemove = ref(null)
const userToReset = ref(null)

const removeOpen = ref(false)
const resetOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 utilisateur'
  return `${store.pagination.total} utilisateur(s)`
})

onMounted(() => {
  loadUsers({ page: 1 })
})

async function loadUsers(params = {}) {
  try {
    await store.fetchUsers({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Users] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les utilisateurs.')
  }
}

async function goToPage(page) {
  await loadUsers({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchUsers(filters)
  } catch (error) {
    console.error('[Users] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche utilisateur impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    search: '',
    role: '',
  }

  await loadUsers({ page: 1 })
}

function fullName(user) {
  return [user?.nom, user?.prenom].filter(Boolean).join(' ') || user?.email || 'cet utilisateur'
}

function askResetPassword(user) {
  userToReset.value = user
  resetOpen.value = true
}

function closeResetPassword() {
  userToReset.value = null
  resetOpen.value = false
}

async function confirmResetPassword(newPassword) {
  if (!userToReset.value?.id) return

  try {
    await store.resetPassword(userToReset.value.id, newPassword)
    closeResetPassword()
  } catch (error) {
    console.error('[Users] Reset mot de passe impossible:', error)
  }
}

function askRemove(user) {
  userToRemove.value = user
  removeOpen.value = true
}

function closeRemove() {
  userToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!userToRemove.value?.id) return

  try {
    await store.removeUser(userToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Users] Suppression impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Utilisateurs système</h1>

        <p class="his-page-subtitle">
          Gestion des comptes de connexion, rôles applicatifs et réinitialisation des mots de passe.
        </p>
      </div>

      <RouterLink to="/users/create">
        <BaseButton> Nouvel utilisateur </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <UserSearchBar
        :filters="store.filters"
        :loading="store.searching"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <UserTable
        :users="store.users"
        :loading="store.loading"
        @reset-password="askResetPassword"
        @remove="askRemove"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || store.pagination.page <= 1"
            @click="goToPage(store.pagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasNext"
            @click="goToPage(store.pagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <UserResetPasswordDialog
      :open="resetOpen"
      :user="userToReset"
      :loading="store.resettingPassword"
      @cancel="closeResetPassword"
      @confirm="confirmResetPassword"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer cet utilisateur"
      :message="`Cette action va supprimer définitivement ${fullName(userToRemove)}. Un administrateur ne doit jamais supprimer son propre compte.`"
      confirm-label="Supprimer utilisateur"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>
