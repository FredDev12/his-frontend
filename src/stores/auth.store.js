import { defineStore } from "pinia"
import { loginUser, getProfile, updateProfile, changePassword, getLoginLogs, logoutUser} from "../api/auth.api"
import {ref} from "vue"
import { useToastStore } from "./toast.store"

export const useAuthStore = defineStore("auth",() =>{

const user = ref(null)
const token = ref(localStorage.getItem("token") || null)
const loading = ref(false)
const loginLogs = ref([])

const toast = useToastStore()


const setAuth = (userData, authToken) =>{
    user.value = userData
    token.value = authToken
    if (authToken){
        localStorage.setItem("token", authToken)
    }
}

const clearAuth = () =>{
    user.value = null
    token.value = null
    localStorage.removeItem("token")
}

const login = async (credentials) =>{
    try {
        const res = await loginUser(credentials)
        setAuth(res.data.user, res.data.token)
        toast.add("Connexion réussie", "success")
    } catch (error) {
        throw error
        toast.error("Erreur lors de la connexion")
    }

}

const logout = async () =>{
    try {
        await logoutUser()
        toast.add("Déconnexion réussie", "success")
    } catch (error) {
        toast.error("Erreur lors de la déconnexion")
    } finally {
        clearAuth()
    }
}

const fetchProfile = async () => {
    try {
        loading.value = true
        const res = await getProfile()
        user.value = res.data.user
        return res.data.user
    } catch (error) {
        toast.error("Erreur lors de la récupération du profil")
        throw error
    } finally {
        loading.value = false
    }
}

const updateUserProfile = async (profileData) => {
    try {
        loading.value = true
        const res = await updateProfile(profileData)
        user.value = res.data.user
        toast.add("Profil mis à jour avec succès", "success")
        return res.data.user
    } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du profil", "error")
        throw error
    } finally {
        loading.value = false
    }
}

const changeUserPassord = async (passwordData) => {
    try {
        loading.value = true
        const res = await changePassword(passwordData)
        toast.add("Mot de passe changé avec succès", "success")
        return res.data
    } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors du changement de mot de passe", "error")
        throw error
    } finally {
        loading.value = false
    }
}

const fetchLoginLogs = async (userId) => {
    try {
        loading.value = true
        const res = await getLoginLogs(userId || user.value?.id)
        loginLogs.value = res.data.logs || []
        return loginLogs.value
    } catch (error) {
        toast.error("Erreur lors de la récupération des logs de connexion")
        throw error
    } finally {
        loading.value = false
    }
}

return {
    user,
    token,
    loading,
    loginLogs,
    login,
    logout,
    fetchProfile,
    updateUserProfile,
    changeUserPassord,
    fetchLoginLogs
}
})