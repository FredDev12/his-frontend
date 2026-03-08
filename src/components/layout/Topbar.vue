<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"
import BaseButton from "../ui/BaseButton.vue"

const router = useRouter()
const auth = useAuthStore()
const showDropdown = ref(false)

const initials = computed(() => {
  const prenom = (auth.user?.prenom || "").trim()
  const nom = (auth.user?.nom || "").trim()
  return (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || "?"
})

const logout = async () => {
  try {
    if (auth.logout) await auth.logout()
  } finally {
    router.push("/login")
  }
}

const goToProfile = () => {
  showDropdown.value = false
  router.push("/profile")
}

// Fermer le dropdown quand on clique ailleurs
const closeDropdown = (e) => {
  if (!e.target.closest('.user-menu')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <header class="bg-white border-b p-4 flex items-center justify-between">
    <div class="font-semibold">
      Système Hospitalier
    </div>

    <div class="flex items-center gap-3 relative user-menu">
      <!-- Nom utilisateur -->
      <div class="text-sm text-gray-700 hidden sm:block">
        {{ auth.user?.prenom || "Utilisateur" }}
      </div>

      <!-- Avatar avec dropdown -->
      <div class="relative">
        <button
          class="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center text-sm font-semibold hover:bg-gray-200 transition cursor-pointer"
          @click.stop="showDropdown = !showDropdown"
        >
          {{ initials }}
        </button>
        
        <!-- Dropdown menu -->
        <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border py-1 z-50"
        >
          <div class="px-4 py-2 border-b text-xs text-gray-500">
            Connecté en tant que<br>
            <span class="font-medium text-gray-700">{{ auth.user?.email }}</span>
          </div>
          
          <button
            @click="goToProfile"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <span>👤</span> Mon Profil
          </button>
          
          
          <button
            @click="logout"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>

      <!-- Logout compact : visible seulement sur mobile -->
      <!--
      <div class="md:hidden">
        <BaseButton variant="danger" @click="logout">
          Logout
        </BaseButton>
      </div> -->
    </div>
  </header>
</template>