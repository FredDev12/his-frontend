import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [],
  }),

  actions: {
    show(message, type = 'info') {
      const id = Date.now() + Math.random()

      this.items.push({
        id,
        message,
        type,
      })

      setTimeout(() => {
        this.remove(id)
      }, 4000)
    },

    success(message) {
      this.show(message, 'success')
    },

    error(message) {
      this.show(message, 'error')
    },

    warning(message) {
      this.show(message, 'warning')
    },

    info(message) {
      this.show(message, 'info')
    },

    remove(id) {
      this.items = this.items.filter((item) => item.id !== id)
    },
  },
})