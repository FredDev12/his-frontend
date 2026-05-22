<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import UserForm from '@/modules/users/components/UserForm.vue'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const toast = useToastStore()

const serverError = ref('')

const userId = computed(() => route.params.id)
const user = computed(() => store.selectedUser)

onMounted(async () => {
  try {
    await store.fetchUserById(userId.value)
  } catch {
    router.push('/users')
  }
})

async function submit(payload) {
  serverError.value = ''

  try {
    await store.updateUser(userId.value, payload)
    router.push(`/users/${userId.value}`)
  } catch (error) {
    console.error('[Users] Erreur modification:', error)

    serverError.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Modification de l’utilisateur impossible.'

    toast.error(serverError.value)
  }
}

function cancel() {
  router.push(`/users/${userId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modifier utilisateur</h1>

      <p class="his-page-subtitle">Modification contrôlée du nom, prénom, email et rôle.</p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de l’utilisateur...
    </div>

    <UserForm
      v-else-if="user"
      :initial-value="user"
      submit-label="Enregistrer modifications"
      :loading="store.saving"
      @submit="submit"
      @cancel="cancel"
    />
  </div>
</template>
