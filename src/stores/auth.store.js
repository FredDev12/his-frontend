import { defineStore } from "pinia"
import { loginUser, getProfile, updateProfile, changePassword, getLoginLogs, logoutUser } from "../api/auth.api"
import { isAuthenticated, getToken, getUser, setAuth as setAuthUtil, clearAuth as clearAuthUtil } from "../utils/auth"
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useToastStore } from "./toast.store"

export const useAuthStore = defineStore("auth", () => {

  const user = ref(getUser())
  const token = ref(getToken())
  const loading = ref(false)
  const loginLogs = ref([])

  const toast = useToastStore()
  const router = useRouter()

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticatedUser = computed(() => {
    return isAuthenticated()
  })

  // Fonctions locales pour manipuler l'état
  const setAuthState = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    setAuthUtil(authToken, userData) // Utilise la fonction importée
  }

  const clearAuthState = () => {
    user.value = null
    token.value = null
    clearAuthUtil() // Utilise la fonction importée
  }

  // Connexion
  const login = async (credentials) => {
    loading.value = true
    try {
      console.log("Tentative de connexion avec:", credentials)
      const res = await loginUser(credentials)
      
      // Vérifier la structure de la réponse
      const userData = res.data.user || res.data
      const authToken = res.data.token || res.data.accessToken

      console.log("Réponse de connexion:", res.data)


      
      setAuthState(userData, authToken)
      toast.add("Connexion réussie", "success")

      const redirect = router.currentRoute.value.query.redirect || "/"
      router.push(redirect)
      
      return res.data
    } catch (error) {
      console.error("Erreur de connexion:", error)
      toast.add(error.response?.data?.message || "Erreur de connexion", "error")
      throw error
    } finally {
      loading.value = false
    }
  }

  // Déconnexion
  const logout = async () => {
    try {
      await logoutUser()
      toast.add("Déconnexion réussie", "success")
    } catch (error) {
      console.error("Erreur lors de la déconnexion API:", error)
      // On ne toast pas l'erreur car on veut déconnecter même si l'API échoue
    } finally {
      clearAuthState()
      router.push("/login")
    }
  }

  // Récupérer le profil
  const fetchProfile = async () => {
    if (!isAuthenticated()) {
      toast.add("Utilisateur non authentifié", "error")
      throw new Error("Utilisateur non authentifié")
    }

    loading.value = true
    try {
      const res = await getProfile()
      const userData = res.data.user || res.data
      
      user.value = userData
      localStorage.setItem("user", JSON.stringify(userData))

      return userData
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuthState()
        toast.add("Session expirée, veuillez vous reconnecter", "warning")
        router.push("/login")
      } else {
        toast.add(error.response?.data?.message || "Erreur lors de la récupération du profil", "error")
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour le profil
  const updateUserProfile = async (profileData) => {
    try {
      loading.value = true
      const res = await updateProfile(profileData)
      const userData = res.data.user || res.data
      
      user.value = userData
      localStorage.setItem("user", JSON.stringify(userData))
      
      toast.add("Profil mis à jour avec succès", "success")
      return userData
    } catch (error) {
      toast.add(error.response?.data?.message || "Erreur lors de la mise à jour du profil", "error")
      throw error
    } finally {
      loading.value = false
    }
  }

  // Changer le mot de passe
  const changeUserPassword = async (passwordData) => {
    try {
      loading.value = true
      const res = await changePassword(passwordData)
      toast.add("Mot de passe changé avec succès", "success")
      return res.data
    } catch (error) {
      toast.add(error.response?.data?.message || "Erreur lors du changement de mot de passe", "error")
      throw error
    } finally {
      loading.value = false
    }
  }

  // Récupérer les logs de connexion
  const fetchLoginLogs = async (userId) => {
    try {
      loading.value = true
      const res = await getLoginLogs(userId || user.value?.id)
      loginLogs.value = res.data.logs || res.data || []
      return loginLogs.value
    } catch (error) {
      toast.add(error.response?.data?.message || "Erreur lors de la récupération des logs", "error")
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    user,
    token,
    loading,
    loginLogs,
    
    // Getters
    isAuthenticated: isAuthenticatedUser,
    
    // Actions
    login,
    logout,
    fetchProfile,
    updateUserProfile,
    changeUserPassword, // Corrigé: changeUserPassord -> changeUserPassword
    fetchLoginLogs
  }
})