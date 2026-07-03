import { defineStore } from "pinia";

import { login as loginApi, logout as logoutApi, me as meApi } from "@/modules/auth/services/auth.api";
import { clearCsrfToken, setCsrfToken } from "@/shared/services/api";

function normalizeUser(payload) {
  return payload?.data?.user ?? payload?.user ?? null;
}

function normalizeCsrfToken(payload) {
  return payload?.data?.csrfToken ?? payload?.csrfToken ?? null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    csrfToken: null,
    loading: false,
    initialized: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),

    permissions: (state) => {
      return Array.isArray(state.user?.permissions) ? state.user.permissions : [];
    },

    roleCode: (state) => state.user?.role?.code ?? state.user?.roleCode ?? state.user?.role ?? null,

    role: (state) => state.user?.role?.code ?? state.user?.roleCode ?? state.user?.role ?? null,

    fullName: (state) => {
      const firstName = state.user?.firstName ?? "";
      const lastName = state.user?.lastName ?? "";

      return `${firstName} ${lastName}`.trim() || "Utilisateur";
    }
  },

  actions: {
    hasPermission(permission) {
      if (!permission) return true;
      return this.permissions.includes(permission);
    },

    hasAnyPermission(permissions = []) {
      if (!permissions.length) return true;
      return permissions.some((permission) => this.hasPermission(permission));
    },

    setSession(payload) {
      const user = normalizeUser(payload);
      const token = normalizeCsrfToken(payload);

      this.user = user;

      if (token) {
        this.csrfToken = token;
        setCsrfToken(token);
      }

      this.error = null;
      this.initialized = true;
    },

    clearSession() {
      this.user = null;
      this.csrfToken = null;
      this.error = null;
      this.initialized = true;
      clearCsrfToken();
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await loginApi(credentials);
        this.setSession(response);

        return response;
      } catch (error) {
        this.clearSession();
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadCurrentUser() {
      this.loading = true;
      this.error = null;

      try {
        const response = await meApi();
        this.setSession(response);

        return response;
      } catch (error) {
        this.clearSession();
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async initialize() {
      if (this.initialized) {
        return this.user
      }

      this.initialized = true

      try {
        if (typeof this.loadCurrentUser === "function") {
          await this.loadCurrentUser()
        }

        return this.user
      } catch {
        return this.user
      }
    },

    async logout() {
      this.loading = true;

      try {
        await logoutApi();
      } finally {
        this.clearSession();
        this.loading = false;
      }
    }
  }
});

export default useAuthStore;




