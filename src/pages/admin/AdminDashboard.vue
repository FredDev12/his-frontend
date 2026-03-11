<script setup>
import { onMounted, computed } from "vue"
import { useAdminStore } from "../../stores/admin.store"
import { useAuthStore } from "../../stores/auth.store"
import BaseCard from "../../components/ui/BaseCard.vue"
import BaseBadge from "../../components/ui/BaseBadge.vue"
import { useRouter } from "vue-router"

const adminStore = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await Promise.all([
    adminStore.fetchStats(),
    adminStore.fetchUsers(1, 5)
  ])
})

const recentUsers = computed(() => adminStore.users.slice(0, 5))

const statsCards = computed(() => [
  { 
    label: "Utilisateurs actifs", 
    value: adminStore.activeUsers.length, 
    icon: "👤", 
    color: "green",
    change: "+12%"
  },
  { 
    label: "Utilisateurs inactifs", 
    value: adminStore.inactiveUsers.length, 
    icon: "😴", 
    color: "gray",
    change: "-3%"
  },
  { 
    label: "Rôles", 
    value: adminStore.roles.length, 
    icon: "🔐", 
    color: "blue",
    change: "0"
  },
  { 
    label: "Connexions aujourd'hui", 
    value: adminStore.stats?.todayLogins || 0, 
    icon: "📊", 
    color: "purple",
    change: "+5"
  }
])

const navigateTo = (path) => router.push(path)
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Administration</h1>
        <p class="text-gray-600 mt-1">
          Gérez les utilisateurs et les permissions du système
        </p>
      </div>
      <BaseButton variant="primary" @click="navigateTo('/admin/users/new')">
        + Nouvel utilisateur
      </BaseButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in statsCards" :key="stat.label"
           class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ stat.label }}</p>
            <p class="text-2xl font-bold mt-1">{{ stat.value }}</p>
          </div>
          <div class="w-12 h-12 rounded-lg" :class="`bg-${stat.color}-100`"></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">{{ stat.change }} vs hier</p>
      </div>
    </div>

    <!-- Graphiques et activités -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Répartition par rôle -->
      <BaseCard class="p-6">
        <h2 class="text-lg font-semibold mb-4">Répartition par rôle</h2>
        <div class="space-y-3">
          <div v-for="(count, role) in adminStore.usersByRole" :key="role"
               class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ role }}</span>
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium">{{ count }}</span>
              <div class="w-24 h-2 bg-gray-200 rounded-full">
                <div class="h-2 bg-blue-600 rounded-full" 
                     :style="{ width: (count / adminStore.users.length * 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Activité récente -->
      <BaseCard class="p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Utilisateurs récents</h2>
          <button @click="navigateTo('/admin/users')" class="text-sm text-blue-600 hover:underline">
            Voir tout →
          </button>
        </div>
        
        <div class="space-y-3">
          <div v-for="user in recentUsers" :key="user.id"
               class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {{ user.prenom?.charAt(0) || 'U' }}
              </div>
              <div>
                <p class="font-medium">{{ user.prenom }} {{ user.nom }}</p>
                <p class="text-xs text-gray-500">{{ user.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <BaseBadge :type="user.status === 'active' ? 'success' : 'danger'">
                {{ user.status === 'active' ? 'Actif' : 'Inactif' }}
              </BaseBadge>
              <BaseBadge type="primary">{{ user.role || 'user' }}</BaseBadge>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Actions rapides -->
    <BaseCard class="p-6">
      <h2 class="text-lg font-semibold mb-4">Actions rapides</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button @click="navigateTo('/admin/users')" 
                class="p-4 border rounded-lg hover:bg-gray-50 text-center">
          <span class="text-2xl block mb-2">👥</span>
          <span class="text-sm font-medium">Gérer utilisateurs</span>
        </button>
        <button @click="navigateTo('/admin/roles')" 
                class="p-4 border rounded-lg hover:bg-gray-50 text-center">
          <span class="text-2xl block mb-2">🔐</span>
          <span class="text-sm font-medium">Gérer rôles</span>
        </button>
        <button @click="navigateTo('/admin/audit')" 
                class="p-4 border rounded-lg hover:bg-gray-50 text-center">
          <span class="text-2xl block mb-2">📋</span>
          <span class="text-sm font-medium">Journal d'audit</span>
        </button>
        <button @click="navigateTo('/admin/settings')" 
                class="p-4 border rounded-lg hover:bg-gray-50 text-center">
          <span class="text-2xl block mb-2">⚙️</span>
          <span class="text-sm font-medium">Paramètres</span>
        </button>
      </div>
    </BaseCard>
  </div>
</template>