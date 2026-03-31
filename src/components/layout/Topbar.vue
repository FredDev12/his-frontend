<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"

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
  <header class="bg-white border-b px-6 py-4 flex items-center justify-between">
    <div class="font-semibold text-gray-800">
      Système Hospitalier
    </div>

    <div class="flex items-center gap-4 relative user-menu">
      <!-- Nom utilisateur -->
      <div class="text-sm text-gray-600">
        {{ auth.user?.prenom || "Utilisateur" }}
      </div>

      <!-- Avatar avec dropdown -->
      <div class="relative">
        <button
          class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold hover:shadow-md transition cursor-pointer"
          @click.stop="showDropdown = !showDropdown"
        >
          {{ initials }}
        </button>
        
        <!-- Dropdown menu -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          leave-active-class="transition duration-150 ease-in"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border py-1 z-50"
          >
            <div class="px-4 py-3 border-b">
              <p class="text-sm font-medium text-gray-900">{{ auth.user?.prenom }} {{ auth.user?.nom }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ auth.user?.email }}</p>
            </div>
            
            <button
              @click="goToProfile"
              class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition"
            >
              <span>👤</span> Mon Profil
            </button>
            
            <div class="border-t my-1"></div>
            
            <button
              @click="logout"
              class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
            >
              <span>🚪</span> Déconnexion
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>