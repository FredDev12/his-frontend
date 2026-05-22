<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import { useUsersStore } from '@/modules/users/stores/users.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useUsersStore()
const toast = useToastStore()

const userId = route.params.id
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

function validate() {
  error.value = ''

  if (!password.value || password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return false
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return false
  }

  return true
}

async function resetPassword() {
  if (!validate()) return

  loading.value = true

  try {
    await store.resetPassword(userId, { password: password.value })
    toast.success('Mot de passe réinitialisé avec succès.')
    router.push('/users')
  } catch (err) {
    console.error('[Users] Réinitialisation impossible:', err)
    toast.error(err.response?.data?.message || 'Réinitialisation du mot de passe impossible.')
  } finally {
    loading.value = false
  }
}

function cancel() {
  router.back()
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Réinitialiser le mot de passe</h1>
      <p class="his-page-subtitle">
        Définissez un nouveau mot de passe pour ce compte utilisateur.
      </p>
    </header>

    <BaseCard>
      <div class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <BaseInput v-model="password" label="Nouveau mot de passe" type="password" required />
          <BaseInput
            v-model="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            required
          />
        </div>

        <div
          v-if="error"
          class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" type="button" @click="cancel">Annuler</BaseButton>
          <BaseButton :loading="loading" type="button" @click="resetPassword"
            >Réinitialiser</BaseButton
          >
        </div>
      </div>
    </BaseCard>
  </div>
</template>
