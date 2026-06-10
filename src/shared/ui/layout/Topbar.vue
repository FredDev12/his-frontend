<script setup>
defineOptions({ name: 'AppTopbar' })

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import NotificationBell from '@/modules/notifications/components/NotificationBell.vue'

const emit = defineEmits(['open-sidebar'])

const router = useRouter()
const auth = useAuthStore()

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        @click="emit('open-sidebar')"
      >
        ☰
      </button>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-900">Système d’Information Hospitalier</p>
        <p class="hidden text-xs text-slate-500 sm:block">
          Suivi patient, workflow clinique, facturation et audit
        </p>
      </div>

      <div class="hidden w-full max-w-sm md:block">
        <input
          type="search"
          placeholder="Rechercher patient, fiche, facture..."
          class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm his-focus"
        />
      </div>
      <div class="flex items-center gap-3">
        <NotificationBell />

        <!-- utilisateur connecté existant -->
      </div>

      <BaseButton variant="secondary" size="sm" @click="logout"> Déconnexion </BaseButton>
    </div>
  </header>
</template>
