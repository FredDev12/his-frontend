import { defineStore } from 'pinia'
import { usersService } from '@/modules/users/services/users.service'
import { useToastStore } from '@/shared/stores/toast.store'
import {
  statusBroadcastService,
  HIS_STATUS_MODULES,
  HIS_STATUSES,
} from '@/shared/services/status-broadcast.service'

const ALLOWED_ROLES = ['admin', 'medecin', 'secretaire', 'patient']

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }

  return fallback
}

function normalizeRole(value) {
  const role = String(value || '').toLowerCase()

  if (role === 'médecin') return 'medecin'
  if (role === 'secrétaire') return 'secretaire'

  return ALLOWED_ROLES.includes(role) ? role : 'patient'
}

function normalizeUser(item) {
  if (!item) return null

  const raw = item

  return {
    raw,

    id: pick(raw, ['id', '_id', 'user_id', 'userId']),
    email: pick(raw, ['email', 'mail'], ''),
    nom: pick(raw, ['nom', 'last_name', 'lastName'], ''),
    prenom: pick(raw, ['prenom', 'prénom', 'first_name', 'firstName'], ''),
    role: normalizeRole(pick(raw, ['role'], 'patient')),

    created_at: pick(raw, ['created_at', 'createdAt'], ''),
    updated_at: pick(raw, ['updated_at', 'updatedAt'], ''),
  }
}

function normalizeListResponse(payload) {
  const rawItems =
    payload?.users || payload?.data || payload?.données || payload?.items || payload?.results || []

  const users = Array.isArray(rawItems) ? rawItems.map(normalizeUser).filter(Boolean) : []

  const pagination = payload?.pagination || payload?.meta || {}

  const page = Number(pagination.page || payload?.page || 1)

  const limite = Number(
    pagination.limit || pagination.limite || payload?.limit || payload?.limite || 20,
  )

  const total = Number(pagination.total || payload?.total || users.length || 0)

  const totalPages = Number(
    pagination.pages ||
      pagination.totalPages ||
      payload?.pages ||
      payload?.totalPages ||
      Math.ceil(total / limite) ||
      1,
  )

  return {
    users,
    total,
    page,
    limite,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

function normalizeSingleResponse(payload) {
  const user = payload?.user || payload?.data || payload?.données || payload?.result || payload

  return normalizeUser(user)
}

function cleanCreatePayload(payload) {
  return {
    email: payload.email,
    password: payload.password,
    nom: payload.nom,
    prenom: payload.prenom,
    role: normalizeRole(payload.role),
  }
}

function cleanUpdatePayload(payload) {
  return {
    nom: payload.nom,
    prenom: payload.prenom,
    email: payload.email,
    role: normalizeRole(payload.role),
  }
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    selectedUser: null,

    loading: false,
    saving: false,
    deleting: false,
    resettingPassword: false,
    searching: false,

    error: '',

    pagination: {
      page: 1,
      limite: 20,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },

    filters: {
      search: '',
      role: '',
    },
  }),

  actions: {
    async fetchUsers(params = {}) {
      this.loading = true
      this.error = ''

      try {
        const payload = await usersService.list({
          page: params.page || this.pagination.page,
          limit: params.limit || params.limite || this.pagination.limite,
          role: params.role ?? this.filters.role,
          search: params.search ?? this.filters.search,
        })

        const normalized = normalizeListResponse(payload)

        this.users = normalized.users
        this.pagination = {
          page: normalized.page,
          limite: normalized.limite,
          total: normalized.total,
          hasNext: normalized.hasNext,
          hasPrev: normalized.hasPrev,
        }

        return normalized
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Impossible de charger les utilisateurs.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async searchUsers(filters = {}) {
      this.searching = true
      this.error = ''

      this.filters = {
        search: filters.search ?? '',
        role: filters.role ?? '',
      }

      try {
        return await this.fetchUsers({
          page: 1,
          limit: this.pagination.limite,
          role: this.filters.role,
          search: this.filters.search,
        })
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Recherche utilisateur impossible.'

        throw error
      } finally {
        this.searching = false
      }
    },

    async fetchUserById(id) {
      this.loading = true
      this.error = ''
      this.selectedUser = null

      try {
        const payload = await usersService.getById(id)
        this.selectedUser = normalizeSingleResponse(payload)

        return this.selectedUser
      } catch (error) {
        this.error =
          error.response?.data?.message || error.response?.data?.error || 'Utilisateur introuvable.'

        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await usersService.create(cleanCreatePayload(payload))
        const created = normalizeSingleResponse(response)

        toast.success('Utilisateur créé avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.USERS,
          id: created?.id,
          status: HIS_STATUSES.USER_CREATED,
          details: {
            action: 'USER_CREATED',
            message: 'Utilisateur système créé',
            user_email: created?.email,
            user_role: created?.role,
          },
        })
        return created
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Création de l’utilisateur impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateUser(id, payload) {
      const toast = useToastStore()

      this.saving = true
      this.error = ''

      try {
        const response = await usersService.update(id, cleanUpdatePayload(payload))
        const updated = normalizeSingleResponse(response)

        if (updated) {
          this.selectedUser = updated
        }

        toast.success('Utilisateur mis à jour avec succès.')

        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.USERS,
          id: updated?.id || id,
          status: HIS_STATUSES.USER_UPDATED,
          details: {
            action: 'USER_UPDATED',
            message: 'Utilisateur système mis à jour',
            user_email: updated?.email,
            user_role: updated?.role,
          },
        })
        return updated
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Mise à jour de l’utilisateur impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.saving = false
      }
    },

    async resetPassword(id, newPassword) {
      const toast = useToastStore()

      this.resettingPassword = true
      this.error = ''

      try {
        await usersService.resetPassword(id, {
          newPassword,
        })

        toast.success('Mot de passe réinitialisé avec succès.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.USERS,
          id,
          status: HIS_STATUSES.USER_PASSWORD_RESET,
          details: {
            action: 'USER_PASSWORD_RESET',
            message: 'Mot de passe utilisateur réinitialisé',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Réinitialisation du mot de passe impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.resettingPassword = false
      }
    },

    async removeUser(id) {
      const toast = useToastStore()

      this.deleting = true
      this.error = ''

      try {
        await usersService.remove(id)

        this.users = this.users.filter((item) => String(item.id) !== String(id))

        toast.success('Utilisateur supprimé avec succès.')
        await statusBroadcastService.broadcastSafe({
          module: HIS_STATUS_MODULES.USERS,
          id,
          status: HIS_STATUSES.USER_DELETED,
          details: {
            action: 'USER_DELETED',
            message: 'Utilisateur système supprimé',
          },
        })
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Suppression de l’utilisateur impossible.'

        this.error = message
        toast.error(message)

        throw error
      } finally {
        this.deleting = false
      }
    },
  },
})
