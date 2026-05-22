<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const globalError = ref('')

function validate() {
  errors.email = ''
  errors.password = ''
  globalError.value = ''

  if (!form.email) {
    errors.email = 'Adresse e-mail obligatoire.'
  }

  if (!form.password) {
    errors.password = 'Mot de passe obligatoire.'
  }

  return !errors.email && !errors.password
}

async function submit() {
  if (!validate()) return

  try {
    await auth.login({
      email: form.email,
      password: form.password,
    })

    router.push(route.query.redirect || '/dashboard')
  } catch {
    globalError.value = 'Connexion impossible. Vérifie les identifiants.'
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="mb-8 text-center lg:hidden">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
        HC
      </div>

      <h1 class="mt-4 text-2xl font-semibold text-slate-950">
        Hôpital CAC
      </h1>

      <p class="mt-1 text-sm text-slate-500">
        Système d’Information Hospitalier
      </p>
    </div>

    <BaseCard>
      <div class="mb-6">
        <p class="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Accès sécurisé
        </p>

        <h2 class="mt-2 text-2xl font-semibold text-slate-950">
          Connexion
        </h2>

        <p class="mt-2 text-sm text-slate-500">
          Connecte-toi avec ton compte utilisateur autorisé.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="submit">
        <div
          v-if="globalError"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ globalError }}
        </div>

        <BaseInput
          v-model="form.email"
          label="Adresse e-mail"
          type="email"
          placeholder="exemple@hopital.com"
          autocomplete="email"
          required
          :error="errors.email"
        />

        <BaseInput
          v-model="form.password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          required
          :error="errors.password"
        />

        <BaseButton
          type="submit"
          class="w-full"
          size="lg"
          :loading="auth.loading"
        >
          Se connecter
        </BaseButton>
      </form>

      <div class="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
        Toute connexion et toute action sensible doivent être tracées côté serveur.
      </div>
    </BaseCard>
  </div>
</template>