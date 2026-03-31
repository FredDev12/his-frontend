<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import BaseButton from "../../components/ui/BaseButton.vue"
import BaseInput from "../../components/ui/BaseInput.vue"
import { useAuthStore } from "../../stores/auth.store"
import { useToastStore } from "../../stores/toast.store"

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

// Form state
const email = ref("")
const password = ref("")
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

// Validation
const errors = ref({})

// Stats pour l'affichage (simulées)
const stats = ref([
  { label: "Patients aujourd'hui", value: "124", icon: "👥", color: "blue" },
  { label: "Urgences", value: "18", icon: "🚨", color: "red" },
  { label: "Consultations", value: "89", icon: "💊", color: "green" },
  { label: "Agents disponibles", value: "42", icon: "👨‍⚕️", color: "purple" }
])

const validateForm = () => {
  const newErrors = {}
  
  if (!email.value) {
    newErrors.email = "L'email est requis"
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    newErrors.email = "Email invalide"
  }
  
  if (!password.value) {
    newErrors.password = "Le mot de passe est requis"
  } else if (password.value.length < 6) {
    newErrors.password = "Minimum 6 caractères"
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const submit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    
    await auth.login({
       email: email.value,
       password: password.value
     })
    
    toast.add("Connexion réussie !", "success")
    router.push("/")
  } catch (error) {
    toast.add(error.response?.data?.message || "Erreur de connexion", "error")
  } finally {
    loading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Raccourci clavier (Entrée)
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !loading.value) {
    submit()
  }
}
</script>

<template>
  <div class="min-h-screen flex items-stretch">
    <!-- Left side - Image/Stats -->
    <div class="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-between">
      <div>
        <h1 class="text-3xl font-bold mb-2">HIS</h1>
        <p class="text-blue-100 text-lg">Health Information System</p>
      </div>
      
      <div class="space-y-8">
        <div>
          <h2 class="text-2xl font-semibold mb-4">Bienvenue sur votre plateforme hospitalière</h2>
          <p class="text-blue-100 leading-relaxed">
            Gérez efficacement vos patients, consultations et urgences en temps réel. 
            Une solution complète pour les professionnels de santé.
          </p>
        </div>
        
        <!-- Stats cards -->
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="stat in stats" 
            :key="stat.label"
            class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
          >
            <div class="text-3xl mb-2">{{ stat.icon }}</div>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <div class="text-sm text-blue-100">{{ stat.label }}</div>
          </div>
        </div>
        
        <!-- Témoignage/Quote 
        <div class="border-l-4 border-blue-300 pl-4 italic text-blue-100">
          "Une interface intuitive qui a transformé notre gestion quotidienne"
          <div class="mt-2 text-sm font-medium">— Dr. Marie K., Médecin chef</div>
        </div>-->
      </div>
      
      <div class="text-sm text-blue-200">
        © 2024 HIS. Tous droits réservés.
      </div>
    </div>
    
    <!-- Right side - Login form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Logo mobile -->
        <div class="text-center lg:hidden mb-8">
          <h1 class="text-2xl font-bold text-gray-900">HIS</h1>
          <p class="text-gray-600">Health Information System</p>
        </div>
        
        <!-- Card de connexion -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Connexion</h2>
            <p class="text-gray-600 mt-2">
              Accédez à votre espace de travail
            </p>
          </div>
          
          <!-- Form -->
          <form @submit.prevent="submit" class="space-y-6">
            <!-- Email field -->
            <div>
              <BaseInput
                v-model="email"
                label="Email professionnel"
                type="email"
                placeholder="exemple@hopital.cd"
                :error="errors.email"
                autocomplete="email"
                @keydown="handleKeyDown"
              />
            </div>
            
            <!-- Password field with visibility toggle -->
            <div>
              <div class="relative">
                <BaseInput
                  v-model="password"
                  label="Mot de passe"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  :error="errors.password"
                  autocomplete="current-password"
                  @keydown="handleKeyDown"
                />
                
                <!-- Toggle password visibility -->
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-9.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  :title="showPassword ? 'Masquer' : 'Afficher'"
                >
                  <span class="text-lg">
                    {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                  </span>
                </button>
              </div>
              
              <!-- Forgot password link -->
              <div class="text-right mt-2">
                <a href="#" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>
            
            <!-- Remember me -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="rememberMe"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Se souvenir de moi</span>
              </label>
              
              <!-- Demo credentials hint (à enlever en prod) -->
              <!--<span class="text-xs text-gray-400">demo: admin@demo.com / 123456</span>-->
            </div>
            
            <!-- Submit button -->
            <BaseButton
              type="submit"
              variant="primary"
              class="w-full py-3 text-base"
              :loading="loading"
            >
              {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
            </BaseButton>
            
            <!-- Security badges -->
            <div class="flex items-center justify-center gap-4 text-xs text-gray-500 pt-4 border-t">
              <span class="flex items-center gap-1">🔒 SSL Sécurisé</span>
              <span class="flex items-center gap-1">🏥 Hopital CAC</span>
            </div>
          </form>
          
          <!-- Sign up link (si applicable) -->
          <p class="text-center text-sm text-gray-600 mt-6">
            Vous n'avez pas de compte ?
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              Contacter l'administrateur
            </a>
          </p>
        </div>
        
        <!-- Mobile footer -->
        <div class="text-center mt-6 text-sm text-gray-500 lg:hidden">
          © 2024 HIS - Tous droits réservés
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation pour les stats cards */
.bg-white\/10 {
  transition: transform 0.2s, background-color 0.2s;
}

.bg-white\/10:hover {
  transform: translateY(-2px);
  background-color: rgba(255, 255, 255, 0.15);
}

/* Style pour l'icône oeil */
button {
  transition: opacity 0.2s;
}

/* Animation pour le formulaire */
.bg-white {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour les champs de saisie */
:deep(input) {
  transition: border-color 0.2s, box-shadow 0.2s;
}

:deep(input:focus) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .min-h-screen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}
</style>