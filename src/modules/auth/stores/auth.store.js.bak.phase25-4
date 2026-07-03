import { defineStore } from 'pinia'
import api, {
  clearCsrfToken,
  clearFrontendSession,
  setCsrfToken,
} from '@/shared/services/api'
import { useToastStore } from '@/shared/stores/toast.store'

const USER_STORAGE_KEY = 'his_user'

function normalizeUser(rawUser) {
  if (!rawUser) return null

  const roleCode =
    rawUser.roleCode ||
    rawUser.role?.code ||
    rawUser.role?.name ||
    rawUser.role ||
    null

  return {
    ...rawUser,
    firstName: rawUser.firstName || rawUser.prenom || rawUser.prénom || '',
    lastName: rawUser.lastName || rawUser.nom || '',
    roleCode,
    permissions: Array.isArray(rawUser.permissions) ? rawUser.permissions : [],
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialized: false,
    loading: false,
    user: null,
    csrfToken: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),

    role: (state) => {
      const roleCode = state.user?.roleCode || null
      return roleCode ? String(roleCode).toLowerCase() : null
    },

    permissions: (state) => state.user?.permissions || [],

    fullName: (state) => {
      if (!state.user) return 'Utilisateur'

      return [state.user.firstName, state.user.lastName]
        .filter(Boolean)
        .join(' ') || state.user.email || 'Utilisateur'
    },

    hasPermission: (state) => {
      return (permission) => {
        if (!permission) return true
        return (state.user?.permissions || []).includes(permission)
      }
    },
  },

  actions: {
    async initialize() {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)

      if (storedUser) {
        try {
          this.user = normalizeUser(JSON.parse(storedUser))
        } catch {
          this.user = null
        }
      }

      try {
        await this.fetchProfile()
      } catch {
        this.clearSession()
      } finally {
        this.initialized = true
      }
    },

    async login(credentials) {
      const toast = useToastStore()

      this.loading = true

      try {
        const response = await api.post('/auth/login', {
          email: credentials.email,
          password: credentials.password,
        })

        const payload = response.data?.data || {}
        const user = normalizeUser(payload.user)
        const csrfToken = payload.csrfToken

        if (!user) {
          throw new Error('Utilisateur absent dans la réponse de connexion.')
        }

        this.user = user
        this.csrfToken = csrfToken || null

        if (csrfToken) {
          setCsrfToken(csrfToken)
        }

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
        localStorage.removeItem('his_access_token')

        toast.success('Connexion réussie.')

        return true
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Identifiants invalides ou serveur indisponible.'

        toast.error(message)

        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      const response = await api.get('/auth/me')

      const payload = response.data?.data || {}
      const user = normalizeUser(payload.user)

      if (!user) {
        throw new Error('Profil utilisateur absent.')
      }

      this.user = user
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

      return user
    },

    async logout() {
      try {
        await api.post('/auth/logout')
      } catch {
        // Même si l’API échoue, la session locale doit être nettoyée.
      } finally {
        this.clearSession()
      }
    },

    clearSession() {
      this.user = null
      this.csrfToken = null

      clearCsrfToken()
      clearFrontendSession()
    },
  },
})