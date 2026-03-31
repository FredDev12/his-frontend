// stores/toast.store.js
import { defineStore } from "pinia"

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: []
  }),

  actions: {
    /**
     * Ajouter un toast
     * @param {string} message - Message à afficher
     * @param {string} type - info, success, error, warning
     * @param {string} position - top-right, top-left, bottom-right, bottom-left, center
     * @param {number} duration - durée en ms (0 = infini)
     */
    add(message, type = "info", position = "top-right", duration = 4000) {
      const id = typeof crypto !== "undefined" ? crypto.randomUUID() : Date.now()

      this.toasts.push({ id, message, type, position })

      if (duration > 0) {
        setTimeout(() => this.remove(id), duration)
      }
    },

    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})