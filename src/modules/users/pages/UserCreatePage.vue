<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import UserForm from '@/modules/users/components/UserForm.vue'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { useToastStore } from '@/shared/stores/toast.store'

const router = useRouter()
const store = useUsersStore()
const toast = useToastStore()

const serverError = ref('')

async function submit(payload) {
  serverError.value = ''

  try {
    const created = await store.createUser(payload)

    if (created?.id) {
      router.push(`/users/${created.id}`)
      return
    }

    router.push('/users')
  } catch (error) {
    console.error('[Users] Erreur création:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Création de l’utilisateur impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push('/users')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Nouvel utilisateur</h1>

      <p class="his-page-subtitle">Création d’un compte de connexion HIS.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <UserForm
      submit-label="Créer utilisateur"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
