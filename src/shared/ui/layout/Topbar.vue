<script setup>
defineOptions({ name: 'AppTopbar' })

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import NotificationBell from '@/modules/notifications/components/NotificationBell.vue'
import GlobalSearchBar from '@/modules/search/components/GlobalSearchBar.vue'

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
    <div class="flex min-h-16 items-center gap-3 px-3 py-2 sm:px-6 lg:px-8">
      <button
        type="button"
        class="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        @click="emit('open-sidebar')"
      >
        ☰
      </button>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-900 sm:text-base">
          Système d’Information Hospitalier
        </p>

        <p class="hidden truncate text-xs text-slate-500 md:block">
          Suivi patient, workflow clinique, facturation et audit
        </p>
      </div>

      <div class="hidden min-w-0 flex-1 md:block lg:max-w-xl">
        <GlobalSearchBar />
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <NotificationBell />

        <button
          type="button"
          class="hidden rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 sm:inline-flex"
          @click="logout"
        >
          Déconnexion
        </button>
      </div>
    </div>

    <div class="border-t border-slate-100 px-3 py-2 md:hidden">
      <GlobalSearchBar />
    </div>
  </header>
</template>

