<script setup>
import { ref, computed, onMounted } from "vue"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"
import BaseButton from "../../components/ui/BaseButton.vue"
import BaseInput from "../../components/ui/BaseInput.vue"
import BaseCard from "../../components/ui/BaseCard.vue"
import BaseBadge from "../../components/ui/BaseBadge.vue"

const auth = useAuthStore()
const toast = useToastStore()

// États des onglets
const activeTab = ref("profile") // profile, password, logs

// Formulaire profil
const profileForm = ref({
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  adresse: ""
})

// Formulaire mot de passe
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
})

// Validation
const passwordErrors = ref({})
const profileErrors = ref({})

// Chargement
const savingProfile = ref(false)
const changingPassword = ref(false)
const loadingLogs = ref(false)

// Initialiser le formulaire avec les données utilisateur
const initProfileForm = () => {
  if (auth.user) {
    profileForm.value = {
      nom: auth.user.nom || "",
      prenom: auth.user.prenom || "",
      email: auth.user.email || "",
      telephone: auth.user.telephone || "",
      adresse: auth.user.adresse || ""
    }
  }
}

// Charger le profil au montage
onMounted(async () => {
  if (!auth.user) {
    await auth.fetchProfile()
  }
  initProfileForm()
})

// Validation du profil
const validateProfile = () => {
  const errors = {}
  
  if (!profileForm.value.nom?.trim()) {
    errors.nom = "Le nom est requis"
  }
  
  if (!profileForm.value.prenom?.trim()) {
    errors.prenom = "Le prénom est requis"
  }
  
  if (!profileForm.value.email?.trim()) {
    errors.email = "L'email est requis"
  } else if (!/\S+@\S+\.\S+/.test(profileForm.value.email)) {
    errors.email = "Email invalide"
  }
  
  profileErrors.value = errors
  return Object.keys(errors).length === 0
}

// Soumettre le formulaire profil
const submitProfile = async () => {
  if (!validateProfile()) return
  
  savingProfile.value = true
  try {
    await auth.updateUserProfile(profileForm.value)
  } finally {
    savingProfile.value = false
  }
}

// Validation du mot de passe
const validatePassword = () => {
  const errors = {}
  
  if (!passwordForm.value.currentPassword) {
    errors.currentPassword = "Mot de passe actuel requis"
  }
  
  if (!passwordForm.value.newPassword) {
    errors.newPassword = "Nouveau mot de passe requis"
  } else if (passwordForm.value.newPassword.length < 6) {
    errors.newPassword = "Minimum 6 caractères"
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas"
  }
  
  passwordErrors.value = errors
  return Object.keys(errors).length === 0
}

// Changer le mot de passe
const changePassword = async () => {
  if (!validatePassword()) return
  
  changingPassword.value = true
  try {
    await auth.changeUserPassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    // Réinitialiser le formulaire
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  } finally {
    changingPassword.value = false
  }
}

// Charger les logs de connexion
const loadLoginLogs = async () => {
  if (!auth.user?.id) return
  
  loadingLogs.value = true
  try {
    const res = await auth.fetchLoginLogs(auth.user.id)
  } finally {
    loadingLogs.value = false
  }
}

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

// Obtenir le type d'appareil à partir du user agent
const getDeviceType = (userAgent) => {
  if (!userAgent) return "Inconnu"
  
  const ua = userAgent.toLowerCase()
  
  if (ua.includes("mobile")) return "📱 Mobile"
  if (ua.includes("tablet")) return "📟 Tablette"
  if (ua.includes("postman")) return "🚀 Postman"
  if (ua.includes("curl")) return "💻 Curl"
  return "💻 Desktop"
}

// Extraire le navigateur du user agent
const getBrowser = (userAgent) => {
  if (!userAgent) return "Inconnu"
  
  if (userAgent.includes("Chrome")) {
    const match = userAgent.match(/Chrome\/(\d+)/)
    return `Chrome ${match ? match[1] : ""}`
  }
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari"
  if (userAgent.includes("Postman")) return "Postman"
  if (userAgent.includes("curl")) return "cURL"
  
  return "Autre"
}

// Initials pour l'avatar
const initials = computed(() => {
  const prenom = auth.user?.prenom || ""
  const nom = auth.user?.nom || ""
  return (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || "?"
})

// Charger les logs quand on active l'onglet
const onTabChange = async (tab) => {
  activeTab.value = tab
  if (tab === "logs" && auth.loginLogs.length === 0) {
    await loadLoginLogs()
  }
}

// Formater l'adresse IP (enlever ::ffff:)
const formatIpAddress = (ip) => {
  if (!ip) return "-"
  return ip.replace(/^::ffff:/, '')
}
</script>

<template>
  <div class="container-page">
    <h1 class="text-2xl font-bold mb-6">Mon Profil</h1>
    
    <div class="grid gap-6 md:grid-cols-4">
      <!-- Sidebar profil -->
      <div class="md:col-span-1">
        <BaseCard>
          <div class="text-center">
            <!-- Avatar -->
            <div class="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 mb-4">
              {{ initials }}
            </div>
            
            <h2 class="font-semibold text-lg">
              {{ auth.user?.prenom }} {{ auth.user?.nom }}
            </h2>
            
            <p class="text-sm text-gray-600 mb-4">
              {{ auth.user?.email }}
            </p>
            
            <BaseBadge type="success" class="mb-4">
              {{ auth.user?.role || "Utilisateur" }}
            </BaseBadge>
          </div>
          
          <!-- Navigation tabs -->
          <div class="border-t pt-4 mt-2 space-y-1">
            <button
              class="w-full text-left px-3 py-2 rounded transition"
              :class="activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'"
              @click="activeTab = 'profile'"
            >
              📋 Informations personnelles
            </button>
            
            <button
              class="w-full text-left px-3 py-2 rounded transition"
              :class="activeTab === 'password' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'"
              @click="activeTab = 'password'"
            >
              🔒 Changer mot de passe
            </button>
            
            <button
              class="w-full text-left px-3 py-2 rounded transition"
              :class="activeTab === 'logs' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'"
              @click="onTabChange('logs')"
            >
              📊 Historique connexions
              <span v-if="auth.loginLogs.length > 0" class="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                {{ auth.loginLogs.length }}
              </span>
            </button>
          </div>
        </BaseCard>
      </div>
      
      <!-- Contenu principal -->
      <div class="md:col-span-3">
        <!-- Onglet Profil -->
        <BaseCard v-if="activeTab === 'profile'">
          <h2 class="text-lg font-semibold mb-4">Modifier mes informations</h2>
          
          <form @submit.prevent="submitProfile" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <BaseInput
                v-model="profileForm.nom"
                placeholder="Nom *"
                :error="profileErrors.nom"
              />
              
              <BaseInput
                v-model="profileForm.prenom"
                placeholder="Prénom *"
                :error="profileErrors.prenom"
              />
              
              <BaseInput
                v-model="profileForm.email"
                placeholder="Email *"
                type="email"
                :error="profileErrors.email"
              />
              
              <BaseInput
                v-model="profileForm.telephone"
                placeholder="Téléphone"
              />
              
              <BaseInput
                v-model="profileForm.adresse"
                placeholder="Adresse"
                class="md:col-span-2"
              />
            </div>
            
            <div class="flex justify-end">
              <BaseButton
                type="submit"
                variant="primary"
                :loading="savingProfile"
              >
                Enregistrer les modifications
              </BaseButton>
            </div>
          </form>
        </BaseCard>
        
        <!-- Onglet Mot de passe -->
        <BaseCard v-if="activeTab === 'password'">
          <h2 class="text-lg font-semibold mb-4">Changer mon mot de passe</h2>
          
          <form @submit.prevent="changePassword" class="space-y-4 max-w-md">
            <BaseInput
              v-model="passwordForm.currentPassword"
              placeholder="Mot de passe actuel *"
              type="password"
              :error="passwordErrors.currentPassword"
              autoComplete="current-password"
            />
            
            <BaseInput
              v-model="passwordForm.newPassword"
              placeholder="Nouveau mot de passe *"
              type="password"
              :error="passwordErrors.newPassword"
              autoComplete="new-password"
            />
            
            <BaseInput
              v-model="passwordForm.confirmPassword"
              placeholder="Confirmer le mot de passe *"
              type="password"
              :error="passwordErrors.confirmPassword"
              autoComplete="new-password"
            />
            
            <div class="flex justify-end">
              <BaseButton
                type="submit"
                variant="primary"
                :loading="changingPassword"
              >
                Changer le mot de passe
              </BaseButton>
            </div>
          </form>
        </BaseCard>
        
        <!-- Onglet Historique -->
        <BaseCard v-if="activeTab === 'logs'" class="flex flex-col h-150">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h2 class="text-lg font-semibold">Historique des connexions</h2>
            
            <BaseButton
              variant="secondary"
              @click="loadLoginLogs"
              :loading="loadingLogs"
              size="sm"
            >
              Actualiser
            </BaseButton>
          </div>
          
          <div v-if="loadingLogs" class="flex-1 flex items-center justify-center text-gray-500">
            Chargement des logs...
          </div>
          
          <div v-else-if="auth.loginLogs.length === 0" class="flex-1 flex items-center justify-center text-gray-500">
            Aucun historique de connexion
          </div>
          
          <div v-else class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <div
              v-for="log in auth.loginLogs"
              :key="log.id"
              class="border rounded p-3 text-sm hover:bg-gray-50 transition"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <span class="font-medium text-gray-700">{{ formatDate(log.login_time) }}</span>
                </div>
                <BaseBadge :type="log.success ? 'success' : 'danger'">
                  {{ log.success ? 'Succès' : 'Échec' }}
                </BaseBadge>
              </div>
              
              <!-- Détails -->
              <div class="grid gap-1 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 w-20">IP:</span>
                  <span class="font-mono">{{ formatIpAddress(log.ip_address) }}</span>
                </div>
                
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 w-20 shrink-0">Appareil:</span>
                  <span class="text-gray-700">{{ getDeviceType(log.user_agent) }}</span>
                </div>
                
                <div class="flex items-start gap-2">
                  <span class="text-gray-500 w-20 shrink-0">Navigateur:</span>
                  <span class="text-gray-700 break-all">{{ getBrowser(log.user_agent) }}</span>
                </div>

                <!-- User agent complet (optionnel, peut être masqué) -->
                <details class="mt-1">
                  <summary class="text-gray-400 text-xs cursor-pointer hover:text-gray-600">
                    Voir user agent complet
                  </summary>
                  <p class="mt-1 text-gray-500 text-xs break-all bg-gray-50 p-2 rounded">
                    {{ log.user_agent }}
                  </p>
                </details>
            </div>
            </div>
          </div>
          <!-- Pied de page avec compteur -->
          <div class="mt-4 pt-2 border-t text-xs text-gray-500 shrink-0">
            Total: {{ auth.loginLogs.length }} connexion(s)
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>