<script setup>
import { ref, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"
import BaseButton from "../ui/BaseButton.vue"

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isCollapsed = ref(false)

const logout = async () => {
  try {
    await auth.logout?.()
  } finally {
    router.push("/login")
  }
}

const profile = () => {
  router.push("/profile")
}

// Menu items avec icônes et badges
const menuItems = [
  { path: "/", name: "Dashboard", icon: "📊", roles: ["admin", "secretaire"] },

  { path: "/reception", name: "Réception", icon: "🏥", roles: ["admin", "secretaire"] },

  { path: "/triage", name: "Triage", icon: "🩺", roles: ["admin", "secretaire"] },

  { path: "/consultation", name: "Consultation", icon: "💊", roles: ["admin", "medecin"] },

  { path: "/fiches", name: "Fiches patient", icon: "📋", roles: ["admin", "medecin", "secretaire"] },

  { path: "/users", name: "Utilisateurs", icon: "👥", roles: ["admin"] },

  { path: "/profile", name: "Mon Profil", icon: "👤", roles: ["admin"] }
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

// Vérifier si un item est actif
const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

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

// Rôle utilisateur
const userRole = computed(() => {
  return auth.user?.role || "Utilisateur"
})
</script>

<template>
  <aside 
    class="hidden md:flex flex-col h-screen bg-linear-to-b from-gray-900 to-gray-800 text-white shadow-xl transition-all duration-300"
    :class="isCollapsed ? 'w-20' : 'w-72'"
  >
    <!-- Header avec logo et toggle -->
    <div class="flex items-center justify-between p-5 border-b border-gray-700">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-lg">H</span>
        </div>
        <h2 class="font-bold text-xl whitespace-nowrap transition-opacity" :class="{ 'opacity-0': isCollapsed }">
          HIS
        </h2>
      </div>
      
      <!-- Toggle button -->
      <button 
        @click="isCollapsed = !isCollapsed"
        class="p-1.5 hover:bg-gray-700 rounded-lg transition"
        :title="isCollapsed ? 'Étendre' : 'Réduire'"
      >
        <span class="text-lg">{{ isCollapsed ? '→' : '←' }}</span>
      </button>
    </div>

    <!-- Profil utilisateur -->
    <div class="p-5 border-b border-gray-700">
      <div class="flex items-center gap-3">
        <!-- Avatar avec gradient -->
        <div class="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 text-lg font-bold">
          {{ initials }}
        </div>
        
        <div class="overflow-hidden transition-opacity" :class="{ 'opacity-0': isCollapsed }">
          <div class="font-semibold truncate">{{ fullName }}</div>
          <div class="text-xs text-gray-400 truncate">{{ userRole }}</div>
          <div class="text-xs text-gray-500 truncate mt-1">{{ auth.user?.email }}</div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scroll">
      <div v-for="item in filteredMenu" :key="item.path">
        <router-link
          :to="item.path"
          class="flex items-center gap-3 p-3 rounded-lg transition-all group relative"
          :class="[
            isActive(item.path) 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          ]"
        >
          <!-- Icône -->
          <span class="text-xl w-6 text-center shrink-0">{{ item.icon }}</span>
          
          <!-- Label et description -->
          <div class="flex-1 overflow-hidden transition-opacity" :class="{ 'opacity-0': isCollapsed }">
            <div class="font-medium truncate">{{ item.name }}</div>
            <div class="text-xs opacity-75 truncate">{{ item.description }}</div>
          </div>
          
          <!-- Badge "new" -->
          <span 
            v-if="item.badge === 'new' && !isCollapsed" 
            class="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse"
          >
            New
          </span>
          
          <!-- Tooltip pour mode réduit -->
          <div 
            v-if="isCollapsed"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition"
          >
            {{ item.name }}
          </div>
        </router-link>
      </div>
    </nav>

    <!-- Footer avec actions -->
    <div class="p-4 border-t border-gray-700 space-y-3">
      <!-- Indicateur de connexion -->
      <div class="flex items-center gap-2 text-xs text-gray-400" :class="{ 'justify-center': isCollapsed }">
        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span v-if="!isCollapsed">Connecté</span>
      </div>

      <!-- Boutons d'action -->
      <div class="space-y-2">
        <!-- Profil -->
        <button
          @click="profile"
          class="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition group relative"
          :class="{ 'justify-center': isCollapsed }"
        >
          <span class="text-xl">⚙️</span>
          <span v-if="!isCollapsed" class="flex-1 text-left">Paramètres</span>
          
          <!-- Tooltip -->
          <div 
            v-if="isCollapsed"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50"
          >
            Profil
          </div>
        </button>

        <!-- Déconnexion -->
        <button
          @click="logout"
          class="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-600/20 hover:text-red-300 transition group relative"
          :class="{ 'justify-center': isCollapsed }"
        >
          <span class="text-xl">🚪</span>
          <span v-if="!isCollapsed" class="flex-1 text-left">Déconnexion</span>
          
          <!-- Tooltip -->
          <div 
            v-if="isCollapsed"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50"
          >
            Déconnexion
          </div>
        </button>
      </div>

      <!-- Version (optionnel) -->
      <div v-if="!isCollapsed" class="text-center text-xs text-gray-600 pt-2">
        Version 2.0.0
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Scrollbar personnalisée */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #4B5563 #1F2937;
}

.custom-scroll::-webkit-scrollbar {
  width: 5px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #1F2937;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #4B5563;
  border-radius: 20px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #6B7280;
}

/* Animation pour les badges */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transitions */
.router-link-active {
  position: relative;
  overflow: hidden;
}

.router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: white;
  border-radius: 0 3px 3px 0;
}

/* Hover effects */
button, a {
  transition: all 0.2s ease;
}

/* Tooltip animation */
.group:hover .opacity-0 {
  opacity: 1;
  transform: translateX(0);
}

/* Mode réduit */
.w-20 {
  .p-5 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>