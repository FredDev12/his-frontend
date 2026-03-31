import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useToastStore } from "./toast.store"
import { useAuthStore } from "./auth.store"
import {
  register,
  getLoginLogs,
  getProfile,
  updateProfile,
  changePassword,
  getUser
} from "../api/auth.api"

export const useAdminStore = defineStore("admin", () => {

  const toast = useToastStore()
  const authStore = useAuthStore()

  const users = ref([])
  const userLogs = ref([])
  const currentUser = ref(null)

  const loading = ref(false)
  const profileLoading = ref(false)
  const passwordLoading = ref(false)

  const roles = ref([
    { id: 1, name: "admin", label: "Administrateur" },
    { id: 2, name: "user", label: "Utilisateur" },
    { id: 3, name: "reception", label: "Réceptionniste" },
    { id: 4, name: "medecin", label: "Médecin" }
  ])

  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  const filters = ref({
    search: "",
    role: "",
    status: ""
  })

  const activeUsers = computed(() =>
    users.value.filter(u => u.status === "active")
  )

  const inactiveUsers = computed(() =>
    users.value.filter(u => u.status === "inactive")
  )

  const usersByRole = computed(() => {
    const result = {}
    users.value.forEach(u => {
      const role = u.role || "user"
      result[role] = (result[role] || 0) + 1
    })
    return result
  })

  // -----------------------------
  // Chargement utilisateurs 
  // -----------------------------

  const fetchUsers = async (page = 1) => {

    loading.value = true

    try {

      const stored = await getUser()
      const allUsers = stored ? JSON.parse(stored) : []

      if (authStore.user && !allUsers.some(u => u.id === authStore.user.id)) {

        allUsers.push({
          ...authStore.user,
          status: "active",
          created_at: new Date().toISOString()
        })

        localStorage.setItem("users", JSON.stringify(allUsers))
      }

      let filtered = [...allUsers]

      if (filters.value.search) {

        const s = filters.value.search.toLowerCase()

        filtered = filtered.filter(u =>
          u.nom?.toLowerCase().includes(s) ||
          u.prenom?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
        )
      }

      if (filters.value.role) {
        filtered = filtered.filter(u => u.role === filters.value.role)
      }

      if (filters.value.status) {
        filtered = filtered.filter(u => u.status === filters.value.status)
      }

      const start = (page - 1) * pagination.value.limit
      const end = start + pagination.value.limit

      users.value = filtered.slice(start, end)

      pagination.value = {
        page,
        limit: pagination.value.limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pagination.value.limit)
      }

    } catch (err) {

      toast.add("Erreur chargement utilisateurs", "error")
      console.log("",err)

    } finally {

      loading.value = false

    }

  }

  // -----------------------------
  // Profil utilisateur connecté
  // -----------------------------

  const fetchCurrentUserProfile = async () => {

    try {

      profileLoading.value = true

      const res = await getProfile()

      currentUser.value = res.data.user || res.data.utilisateur || res.data

      return currentUser.value

    } catch (err) {

      toast.add("Erreur chargement profil", "error")

      throw err

    } finally {

      profileLoading.value = false

    }

  }

  const updateCurrentUserProfile = async (data) => {

    try {

      profileLoading.value = true

      const res = await updateProfile(data)

      const user = res.data.user || res.data.utilisateur

      authStore.user = { ...authStore.user, ...user }

      currentUser.value = { ...currentUser.value, ...user }

      toast.add("Profil mis à jour", "success")

      return user

    } catch (err) {

      toast.add("Erreur mise à jour profil", "error")

      throw err

    } finally {

      profileLoading.value = false

    }

  }

  // -----------------------------
  // Password
  // -----------------------------

  const changeUserPassword = async (data) => {

    try {

      passwordLoading.value = true

      const res = await changePassword(data)

      toast.add("Mot de passe changé", "success")

      return res.data

    } catch (err) {

      toast.add("Erreur changement mot de passe", "error")

      throw err

    } finally {

      passwordLoading.value = false

    }

  }

  // -----------------------------
  // Création utilisateur
  // -----------------------------

  const addUser = async (data) => {

    try {

      loading.value = true

      const res = await register({
        email: data.email,
        password: data.password,
        nom: data.nom,
        prenom: data.prenom,
        role: data.role || "user"
      })

      const newUser = {
        ...res.data.user,
        status: "active",
        created_at: new Date().toISOString()
      }

      const stored = localStorage.getItem("users")
      const allUsers = stored ? JSON.parse(stored) : []

      allUsers.push(newUser)

      localStorage.setItem("users", JSON.stringify(allUsers))

      await fetchUsers()

      toast.add("Utilisateur créé", "success")

      return newUser

    } catch (err) {

      toast.add("Erreur création utilisateur", "error")

      throw err

    } finally {

      loading.value = false

    }

  }

  // -----------------------------
  // Logs
  // -----------------------------

  const fetchUserLogs = async (userId) => {

    try {

      loading.value = true

      const res = await getLoginLogs(userId)

      userLogs.value = res.data.logs || res.data.journaux || []

      return userLogs.value

    } catch (err) {

      toast.add("Erreur chargement logs", "error")

      userLogs.value = []

    } finally {

      loading.value = false

    }

  }

  // -----------------------------

  const clearCurrentUser = () => {

    currentUser.value = null
    userLogs.value = []

  }

  return {

    users,
    roles,
    userLogs,
    currentUser,

    loading,
    profileLoading,
    passwordLoading,

    pagination,
    filters,

    activeUsers,
    inactiveUsers,
    usersByRole,

    fetchUsers,
    fetchCurrentUserProfile,
    updateCurrentUserProfile,
    changeUserPassword,
    addUser,
    fetchUserLogs,
    clearCurrentUser

  }

})