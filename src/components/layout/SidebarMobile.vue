<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()


// État du menu mobile
const isMenuOpen = ref(false)
const isMenuAnimating = ref(false)

// Menu items
const menuItems = [
  { path: "/", name: "Dashboard", icon: "📊", roles: ["admin"] },

  { path: "/reception", name: "Réception", icon: "🏥", roles: ["admin", "secretaire"] },

  { path: "/triage", name: "Triage", icon: "🩺", roles: ["admin", "secretaire"] },

  { path: "/consultation", name: "Consultation", icon: "💊", roles: ["admin", "medecin"] },

  { path: "/fiches", name: "Fiches patient", icon: "📋", roles: ["admin", "medecin", "secretaire"] },

  { path: "/users", name: "Utilisateurs", icon: "👥", roles: ["admin"] },

  { path: "/profile", name: "Mon Profil", icon: "👤", roles: ["admin", "medecin", "secretaire", "patient"] }
]

const filteredMenu = computed(() => {
  const role = auth.user?.role

  // 🔥 admin → accès total
  if (role === "admin") return menuItems

  // 🔒 filtrage normal
  return menuItems.filter(item =>
    item.roles?.includes(role)
  )
})

// Initiales pour l'avatar
const initials = computed(() => {
  const prenom = auth.user?.prenom || ""
  const nom = auth.user?.nom || ""
  return (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || "U"
})

// Nom complet
const fullName = computed(() => {
  const prenom = auth.user?.prenom || ""
  const nom = auth.user?.nom || ""
  return `${prenom} ${nom}`.trim() || "Utilisateur"
})

// Vérifier si un item est actif
const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Fermer le menu
const closeMenu = () => {
  isMenuAnimating.value = true
  isMenuOpen.value = false
  setTimeout(() => {
    isMenuAnimating.value = false
  }, 300)
}

// Ouvrir le menu
const openMenu = () => {
  isMenuOpen.value = true
}

// Navigation
const navigateTo = (path) => {
  router.push(path)
  closeMenu()
}

// Déconnexion
const logout = async () => {
  try {
    if (auth.logout) await auth.logout()
  } finally {
    closeMenu()
    router.push("/login")
  }
}

// Fermer le menu avec la touche Escape
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
  }
}

// Empêcher le scroll du body quand le menu est ouvert
const toggleBodyScroll = (disable) => {
  if (disable) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  toggleBodyScroll(false)
})

// Watch pour le scroll
watch(isMenuOpen, (newVal) => {
  toggleBodyScroll(newVal)
})
</script>

<template>
  <!-- Header mobile avec menu hamburger -->
  <header class="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-lg">H</span>
      </div>
      <span class="font-bold text-lg">HIS</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <!-- Notifications (optionnel) -->
      <button class="p-2 hover:bg-gray-100 rounded-lg relative">
        <span class="text-xl">🔔</span>
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- Menu hamburger -->
      <button 
        @click="openMenu"
        class="p-2 hover:bg-gray-100 rounded-lg"
        aria-label="Menu"
      >
        <div class="w-6 h-5 flex flex-col justify-between">
          <span class="w-full h-0.5 bg-gray-600 rounded transition"></span>
          <span class="w-full h-0.5 bg-gray-600 rounded transition"></span>
          <span class="w-full h-0.5 bg-gray-600 rounded transition"></span>
        </div>
      </button>
    </div>
  </header>

  <!-- Overlay (fond sombre) -->
  <transition
    enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="isMenuOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="closeMenu"
    ></div>
  </transition>

  <!-- Sidebar mobile -->
  <transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-300 ease-in"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <aside 
      v-if="isMenuOpen || isMenuAnimating"
      class="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 md:hidden flex flex-col overflow-hidden"
    >
      <!-- Header du menu - plus subtil -->
      <div class="px-5 py-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-500 uppercase tracking-wider">Menu</span>
          
          <!-- Bouton fermer -->
          <button 
            @click="closeMenu"
            class="p-1 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-700"
          >
            <span class="text-xl">✕</span>
          </button>
        </div>
      </div>

      <!-- Profil utilisateur - design épuré -->
      <div class="px-5 py-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-800 truncate">{{ fullName }}</div>
            <div class="text-xs text-gray-500 truncate">{{ auth.user?.email }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-3 custom-scroll">
        <div class="space-y-1">
          <div v-for="item in filteredMenu" :key="item.path">
            <button
              @click="navigateTo(item.path)"
              class="w-full flex items-center gap-3 p-3 rounded-xl transition relative"
              :class="[
                isActive(item.path) 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'hover:bg-gray-50 text-gray-700'
              ]"
            >
              <!-- Icône avec fond -->
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                :class="isActive(item.path) ? 'bg-blue-100' : 'bg-gray-100'"
              >
                {{ item.icon }}
              </div>
              
              <!-- Texte -->
              <div class="flex-1 text-left">
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-xs text-gray-500">{{ item.description }}</div>
              </div>
              
              <!-- Badge -->
              <span 
                v-if="item.badge === 'new'" 
                class="px-2 py-1 text-xs bg-red-500 text-white rounded-full"
              >
                New
              </span>

              <!-- Flèche pour indiquer l'élément actif -->
              <span v-if="isActive(item.path)" class="text-blue-600 text-lg">→</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- Section déconnexion - bloquée en bas avec mt-auto -->
      <div class="mt-auto p-3 border-t border-gray-100">
        <button
          @click="logout"
          class="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition"
        >
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl">
            🚪
          </div>
          <div class="flex-1 text-left">
            <div class="font-medium">Déconnexion</div>
            <div class="text-xs text-gray-500">Se déconnecter de l'application</div>
          </div>
        </button>

        <!-- Footer -->
        <div class="mt-3 text-center text-xs text-gray-400">
          Version 2.0.0 • HIS Mobile
        </div>
      </div>
    </aside>
  </transition>
</template>

<style scoped>
/* Scrollbar personnalisée */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 20px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* Animation du hamburger */
.hamburger-open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-open span:nth-child(2) {
  opacity: 0;
}

.hamburger-open span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Support du safe area pour les appareils modernes */
@supports (padding: max(0px)) {
  .pt-safe {
    padding-top: max(env(safe-area-inset-top), 1rem);
  }
  
  .pb-safe {
    padding-bottom: max(env(safe-area-inset-bottom), 1rem);
  }
}
</style>