<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import UserIdentityCard from '@/modules/users/components/UserIdentityCard.vue'
import UserResetPasswordDialog from '@/modules/users/components/UserResetPasswordDialog.vue'

import { useUsersStore } from '@/modules/users/stores/users.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const toast = useToastStore()

const resetOpen = ref(false)

const userId = computed(() => route.params.id)
const user = computed(() => store.selectedUser)

onMounted(async () => {
  try {
    await store.fetchUserById(userId.value)
  } catch (error) {
    console.error('[Users] Utilisateur introuvable:', error)
    toast.error(error.response?.data?.message || 'Utilisateur introuvable.')
    router.push('/users')
  }
})

function openReset() {
  resetOpen.value = true
}

function closeReset() {
  resetOpen.value = false
}

async function confirmReset(newPassword) {
  if (!user.value?.id) return

  try {
    await store.resetPassword(user.value.id, newPassword)
    closeReset()
  } catch (error) {
    console.error('[Users] Reset mot de passe impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail utilisateur</h1>

        <p class="his-page-subtitle">Informations du compte système et rôle applicatif.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/users">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <BaseButton v-if="user" variant="warning" @click="openReset">
          Réinitialiser mot de passe
        </BaseButton>

        <RouterLink v-if="user" :to="`/users/${user.id}/edit`">
          <BaseButton> Modifier utilisateur </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de l’utilisateur...
    </div>

    <UserIdentityCard v-else-if="user" :user="user" />

    <UserResetPasswordDialog
      :open="resetOpen"
      :user="user"
      :loading="store.resettingPassword"
      @cancel="closeReset"
      @confirm="confirmReset"
    />
  </div>
</template>
