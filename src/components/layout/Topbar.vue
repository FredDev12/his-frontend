<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"
import BaseButton from "../ui/BaseButton.vue"

const router = useRouter()
const auth = useAuthStore()

const initials = computed(() => {
  const p = (auth.user?.prenom || "").trim()
  return p ? p.slice(0, 1).toUpperCase() : "?"
})

const logout = async () => {
  try {
    if (auth.logout) await auth.logout()
  } finally {
    router.push("/login")
  }
}
</script>

<template>
  <header class="bg-white border-b p-4 flex items-center justify-between">
    <div class="font-semibold">
      Système Hospitalier
    </div>

    <div class="flex items-center gap-3">
      <!-- Nom utilisateur -->
      <div class="text-sm text-gray-700 hidden sm:block">
        {{ auth.user?.prenom || "Utilisateur" }}
      </div>

      <!-- Avatar simple -->
      <div class="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center text-sm font-semibold">
        {{ initials }}
      </div>

      <!-- Logout compact : visible seulement sur mobile -->
      <div class="md:hidden">
        <BaseButton variant="danger" @click="logout">
          Logout
        </BaseButton>
      </div>
    </div>
  </header>
</template>