import { defineStore } from 'pinia'
import api from '@/shared/services/api'
import { useToastStore } from '@/shared/stores/toast.store'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialized: false,
    loading: false,
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user || state.token),

    role: (state) => {
      return state.user?.role || state.user?.rôle || null
    },

    fullName: (state) => {
      if (!state.user) return 'Utilisateur'

      return [state.user.prenom || state.user.prénom, state.user.nom]
        .filter(Boolean)
        .join(' ')
    },
  },

  actions: {
    async initialize() {
      const storedToken = localStorage.getItem('his_access_token')
      const storedUser = localStorage.getItem('his_user')

      this.token = storedToken

      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser)
        } catch {
          this.user = null
        }
      }

      if (this.token || this.user) {
        try {
          await this.fetchProfile()
        } catch {
          this.clearSession()
        }
      }

      this.initialized = true
    },

    async login(credentials) {
      const toast = useToastStore()

      this.loading = true

      try {
        const response = await api.post('/auth/login', credentials)

        const data = response.data || {}
        const user = data.user || data.utilisateur || data.data?.user || data.data?.utilisateur
        const token = data.token || data.accessToken || data.data?.token

        this.user = user || {
          email: credentials.email,
          role: 'admin',
          nom: 'Utilisateur',
        }

        this.token = token || null

        if (this.token) {
          localStorage.setItem('his_access_token', this.token)
        }

        localStorage.setItem('his_user', JSON.stringify(this.user))

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
      const response = await api.get('/auth/profile')

      const data = response.data || {}
      const user = data.user || data.utilisateur || data.data || data

      this.user = user
      localStorage.setItem('his_user', JSON.stringify(user))

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
      this.token = null

      localStorage.removeItem('his_access_token')
      localStorage.removeItem('his_user')
    },
  },
})