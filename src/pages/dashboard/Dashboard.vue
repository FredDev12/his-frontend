<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"
import BaseCard from "../../components/ui/BaseCard.vue"
import BaseBadge from "../../components/ui/BaseBadge.vue"
import BaseButton from "../../components/ui/BaseButton.vue"
import { getPatients } from "../../api/patients.api"
import { getAgents, getAgentStats } from "../../api/agents.api"
import { getLoginLogs } from "../../api/auth.api"

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

// État des données
const loading = ref({
  patients: true,
  agents: true,
  logs: true,
  stats: true
})

const stats = ref({
  patientsToday: 0,
  emergencies: 0,
  consultations: 0,
  newPatients: 0,
  returns: 0,
  averageWaitTime: "12 min",
  occupancyRate: 78
})

const recentPatients = ref([])
const recentAgents = ref([])
const recentLogs = ref([])
const agentStats = ref(null)

// Couleurs pour les graphiques
const colors = {
  primary: "#2563eb",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#f59e0b",
  info: "#3b82f6"
}

// Charger toutes les données
const loadDashboardData = async () => {
  try {
    await Promise.all([
      loadPatientsData(),
      loadAgentsData(),
      loadLogsData(),
      loadAgentStats()
    ])
  } catch (error) {
    toast.add("Erreur lors du chargement des données", "error")
  }
}

// Charger les données patients
const loadPatientsData = async () => {
  loading.value.patients = true
  try {
    const response = await getPatients()
    const patients = response.data.data || []

    
    // Calculer les stats
    const today = new Date().toDateString()
    const patientsToday = patients.filter(p => 
      new Date(p.created_at).toDateString() === today
    )
    
    stats.value.patientsToday = patientsToday.length
    stats.value.emergencies = patients.filter(p => p.urgence).length
    stats.value.consultations = Math.floor(patients.length * 0.7) // Simulation
    
    // Derniers patients
    recentPatients.value = patients
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
    
  } catch (error) {
    console.error("Erreur chargement patients:", error)
  } finally {
    loading.value.patients = false
  }
}

// Charger les données agents
const loadAgentsData = async () => {
  loading.value.agents = true
  try {
    const response = await getAgents(1, 10)
    recentAgents.value = response.data?.data || []
  } catch (error) {
    console.error("Erreur chargement agents:", error)
  } finally {
    loading.value.agents = false
  }
}

// Charger les stats agents
const loadAgentStats = async () => {
  loading.value.stats = true
  try {
    const response = await getAgentStats()
    agentStats.value = response.data.data
  } catch (error) {
    console.error("Erreur chargement stats agents:", error)
  } finally {
    loading.value.stats = false
  }
}

// Charger les logs récents
const loadLogsData = async () => {
  if (!auth.user?.id) return
  
  loading.value.logs = true
  try {
    const response = await getLoginLogs(auth.user.id)
    recentLogs.value = (response.data.logs || []).slice(0, 5)
  } catch (error) {
    console.error("Erreur chargement logs:", error)
  } finally {
    loading.value.logs = false
  }
}

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

// Navigation
const goToReception = () => router.push("/reception")
const goToFiches = () => router.push("/reception/fiches")
const goToProfile = () => router.push("/profile")

// Charger au montage
onMounted(() => {
  loadDashboardData()
})

// Bienvenue personnalisée
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return "Bonjour"
  if (hour < 18) return "Bon après-midi"
  return "Bonsoir"
})
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête avec bienvenue -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ greeting }}, {{ auth.user?.prenom || "Utilisateur" }}
        </h1>
        <p class="text-gray-600 mt-1">
          Voici un résumé de l'activité d'aujourd'hui
        </p>
      </div>
      
      <div class="flex gap-3">
        <BaseButton variant="primary" @click="goToReception">
          + Nouvelle réception
        </BaseButton>
        <BaseButton variant="secondary" @click="goToFiches">
          Voir les fiches
        </BaseButton>
      </div>
    </div>

    <!-- Stats cards modernes -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Patients aujourd'hui -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Patients aujourd'hui</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ loading.patients ? "..." : stats.patientsToday }}
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👥</span>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-600 font-medium">+12%</span>
          <span class="text-gray-500 ml-2">vs hier</span>
        </div>
      </div>

      <!-- Urgences -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Urgences</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ loading.patients ? "..." : stats.emergencies }}
            </p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🚨</span>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-red-600 font-medium">+3</span>
          <span class="text-gray-500 ml-2">nouvelles</span>
        </div>
      </div>

      <!-- Consultations -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Consultations</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ loading.patients ? "..." : stats.consultations }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💊</span>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-gray-500">Taux: 70%</span>
        </div>
      </div>

      <!-- Taux occupation -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Occupation</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ stats.occupancyRate }}%
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🏥</span>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-purple-600 h-2 rounded-full" 
              :style="{ width: stats.occupancyRate + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques et activités -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Graphique activité (simulé) -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Activité hebdomadaire</h2>
          <select class="text-sm border rounded-lg px-3 py-1.5 bg-gray-50">
            <option>Cette semaine</option>
            <option>Ce mois</option>
            <option>Cette année</option>
          </select>
        </div>
        
        <!-- Graphique simple -->
        <div class="h-64 flex items-end justify-between gap-2">
          <div v-for="(day, i) in ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']" 
               :key="i" 
               class="flex-1 flex flex-col items-center gap-2">
            <div 
              class="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
              :style="{ 
                height: (40 + Math.random() * 60) + 'px',
                backgroundColor: i === new Date().getDay() - 1 ? colors.primary : colors.info
              }"
            ></div>
            <span class="text-xs text-gray-600">{{ day }}</span>
          </div>
        </div>
      </div>

      <!-- Activités récentes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold mb-4">Activités récentes</h2>
        
        <div v-if="loading.logs" class="space-y-3">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="log in recentLogs" :key="log.id" class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span>{{ log.success ? '✅' : '❌' }}</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">
                Connexion {{ log.success ? 'réussie' : 'échouée' }}
              </p>
              <p class="text-xs text-gray-500">{{ formatDate(log.login_time) }}</p>
            </div>
            <BaseBadge :type="log.success ? 'success' : 'danger'" size="sm">
              {{ log.success ? 'Succès' : 'Échec' }}
            </BaseBadge>
          </div>
        </div>
        
        <button 
          @click="goToProfile" 
          class="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Voir tous les logs →
        </button>
      </div>
    </div>

    <!-- Tableaux récents -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Derniers patients -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Derniers patients</h2>
          <button @click="goToFiches" class="text-sm text-blue-600 hover:text-blue-800">
            Voir tout →
          </button>
        </div>
        
        <div v-if="loading.patients" class="space-y-3">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="patient in recentPatients" 
            :key="patient.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span class="text-lg">👤</span>
              </div>
              <div>
                <p class="font-medium">{{ patient.nom }} {{ patient.prenom }}</p>
                <p class="text-xs text-gray-500">#{{ patient.numero_patient }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <BaseBadge :type="patient.urgence ? 'danger' : 'primary'">
                {{ patient.urgence ? 'Urgence' : 'Normal' }}
              </BaseBadge>
              <span class="text-xs text-gray-400">{{ formatDate(patient.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Derniers agents -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Derniers agents CAC</h2>
          <button class="text-sm text-blue-600 hover:text-blue-800">
            Voir tout →
          </button>
        </div>
        
        <div v-if="loading.agents" class="space-y-3">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="agent in recentAgents" 
            :key="agent.cac_id_co"
            class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span class="text-lg">👨‍⚕️</span>
              </div>
              <div>
                <p class="font-medium">{{ agent.nom_post }}</p>
                <p class="text-xs text-gray-500">{{ agent.fonction }} • {{ agent.site }}</p>
              </div>
            </div>
            <BaseBadge type="primary">{{ agent.sexe }}</BaseBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats agents (si disponibles) -->
    <div v-if="agentStats" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-semibold mb-4">Statistiques agents</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">{{ agentStats.total || 0 }}</p>
          <p class="text-sm text-gray-600">Total agents</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600">{{ agentStats.actifs || 0 }}</p>
          <p class="text-sm text-gray-600">Agents actifs</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ agentStats.nouveaux || 0 }}</p>
          <p class="text-sm text-gray-600">Nouveaux (mois)</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-purple-600">{{ agentStats.sites || 0 }}</p>
          <p class="text-sm text-gray-600">Sites</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation pour les cartes */
.card-hover {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-hover:hover {
  transform: translateY(-2px);
}

/* Animation pour le graphique */
.bar-animation {
  animation: grow 0.5s ease-out;
}

@keyframes grow {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>