import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { useToastStore } from "./toast.store"
import { 
    register,
    verifyToken,
    getProfile,
    getLoginLogs,
    updateProfile,
    changePassword
} from "../api/auth.api"

export const useAdminStore = defineStore("admin", () => {
  const toast = useToastStore()
  
  // État
  const users = ref([])
  const roles = ref([
    { id: 1, name: "admin", label: "Administrateur" },
    { id: 2, name: "user", label: "Utilisateur" },
    { id: 3, name: "reception", label: "Réceptionniste" },
    { id: 4, name: "medecin", label: "Médecin" }
  ])
  const stats = ref(null)
  const userLogs = ref([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  // Filtres
  const filters = ref({
    search: "",
    role: "",
    status: ""
  })

  // Getters
  const activeUsers = computed(() => 
    users.value.filter(u => u.status === 'active')
  )

  const inactiveUsers = computed(() => 
    users.value.filter(u => u.status === 'inactive')
  )

  const usersByRole = computed(() => {
    const byRole = {}
    users.value.forEach(user => {
      const role = user.role || 'user'
      byRole[role] = (byRole[role] || 0) + 1
    })
    return byRole
  })

  // Actions - Gestion des utilisateurs via register
  const fetchUsers = async (page = 1) => {
    loading.value = true
    try {
      // Simulation - Dans un cas réel, il faudrait un endpoint GET /users
      // En attendant, on peut stocker dans localStorage
      const storedUsers = localStorage.getItem('users')
      const allUsers = storedUsers ? JSON.parse(storedUsers) : []
      
      // Filtrer selon les critères
      let filteredUsers = [...allUsers]
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filteredUsers = filteredUsers.filter(u => 
          u.nom?.toLowerCase().includes(search) ||
          u.prenom?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search)
        )
      }
      
      if (filters.value.role) {
        filteredUsers = filteredUsers.filter(u => u.role === filters.value.role)
      }
      
      if (filters.value.status) {
        filteredUsers = filteredUsers.filter(u => u.status === filters.value.status)
      }
      
      // Pagination
      const start = (page - 1) * pagination.value.limit
      const end = start + pagination.value.limit
      
      users.value = filteredUsers.slice(start, end)
      pagination.value = {
        page,
        limit: pagination.value.limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / pagination.value.limit)
      }
      
    } catch (error) {
      toast.add("Erreur lors du chargement des utilisateurs", "error")
    } finally {
      loading.value = false
    }
  }

  const fetchUserById = async (id) => {
    try {
      const storedUsers = localStorage.getItem('users')
      const allUsers = storedUsers ? JSON.parse(storedUsers) : []
      const user = allUsers.find(u => u.id === id)
      
      if (!user) throw new Error("Utilisateur non trouvé")
      
      // Récupérer les logs de connexion si disponibles
      try {
        const logsResponse = await getLoginLogs(id)
        user.logs = logsResponse.data
      } catch (e) {
        user.logs = []
      }
      
      return user
    } catch (error) {
      toast.add("Utilisateur non trouvé", "error")
      throw error
    }
  }

  const addUser = async (userData) => {
    try {
      // Utiliser register pour créer l'utilisateur
      const response = await register({
        email: userData.email,
        password: userData.password,
        nom: userData.nom,
        prenom: userData.prenom,
        role: userData.role || 'user'
      })
      
      // Stocker dans localStorage pour la persistence
      const storedUsers = localStorage.getItem('users')
      const allUsers = storedUsers ? JSON.parse(storedUsers) : []
      
      const newUser = {
        ...response.data.user,
        id: response.data.user.id || Date.now(),
        status: 'active',
        created_at: new Date().toISOString(),
        telephone: userData.telephone,
        adresse: userData.adresse
      }
      
      allUsers.push(newUser)
      localStorage.setItem('users', JSON.stringify(allUsers))
      
      await fetchUsers(pagination.value.page)
      toast.add("Utilisateur créé avec succès", "success")
      return newUser
      
    } catch (error) {
      toast.add(error.response?.data?.message || "Erreur création", "error")
      throw error
    }
  }

  const editUser = async (id, userData) => {
    try {
      const storedUsers = localStorage.getItem('users')
      const allUsers = storedUsers ? JSON.parse(storedUsers) : []
      const index = allUsers.findIndex(u => u.id === id)
      
      if (index === -1) throw new Error("Utilisateur non trouvé")
      
      // Mettre à jour l'utilisateur
      allUsers[index] = {
        ...allUsers[index],
        ...userData,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('users', JSON.stringify(allUsers))
      
      await fetchUsers(pagination.value.page)
      toast.add("Utilisateur modifié avec succès", "success")
      return allUsers[index]
      
    } catch (error) {
      toast.add("Erreur modification", "error")
      throw error
    }
  }

  const removeUser = async (id) => {
    try {
      const storedUsers = localStorage.getItem('users')
      const allUsers = storedUsers ? JSON.parse(storedUsers) : []
      const filteredUsers = allUsers.filter(u => u.id !== id)
      
      localStorage.setItem('users', JSON.stringify(filteredUsers))
      
      await fetchUsers(pagination.value.page)
      toast.add("Utilisateur supprimé avec succès", "success")
      
    } catch (error) {
      toast.add("Erreur lors de la suppression", "error")
      throw error
    }
  }

  const toggleStatus = async (id) => {
    try {
      const storedUsers = localStorage.getItem('users')
      const allUsers = storedUsers ? JSON.parse(storedUsers) : []
      const index = allUsers.findIndex(u => u.id === id)
      
      if (index === -1) throw new Error("Utilisateur non trouvé")
      
      allUsers[index].status = allUsers[index].status === 'active' ? 'inactive' : 'active'
      localStorage.setItem('users', JSON.stringify(allUsers))
      
      await fetchUsers(pagination.value.page)
      toast.add("Statut modifié avec succès", "success")
      
    } catch (error) {
      toast.add("Erreur modification statut", "error")
      throw error
    }
  }

  const resetPassword = async (id) => {
    try {
      // Simulation - Dans un vrai projet, il faudrait un endpoint de reset
      toast.add("Email de réinitialisation envoyé", "success")
      return { message: "Password reset email sent" }
      
    } catch (error) {
      toast.add("Erreur réinitialisation", "error")
      throw error
    }
  }

  const fetchUserLogs = async (userId) => {
    try {
      const response = await getLoginLogs(userId)
      userLogs.value = response.data.logs || response.data || []
      return userLogs.value
    } catch (error) {
      console.error("Erreur logs:", error)
      userLogs.value = []
    }
  }

  const fetchStats = async () => {
    try {
      const storedUsers = localStorage.getItem('users')
      const allUsers = storedUsers ? JSON.parse(storedUsers) : []
      
      stats.value = {
        total: allUsers.length,
        active: allUsers.filter(u => u.status === 'active').length,
        inactive: allUsers.filter(u => u.status === 'inactive').length,
        todayLogins: 0, // À calculer si possible
        byRole: usersByRole.value
      }
      
    } catch (error) {
      console.error("Erreur stats:", error)
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    fetchUsers(1)
  }

  const resetFilters = () => {
    filters.value = {
      search: "",
      role: "",
      status: ""
    }
    fetchUsers(1)
  }

  return {
    // État
    users,
    roles,
    stats,
    userLogs,
    loading,
    pagination,
    filters,
    
    // Getters
    activeUsers,
    inactiveUsers,
    usersByRole,
    
    // Actions
    fetchUsers,
    fetchUserById,
    fetchUserLogs,
    fetchStats,
    addUser,
    editUser,
    removeUser,
    toggleStatus,
    resetPassword,
    setFilters,
    resetFilters
  }
})