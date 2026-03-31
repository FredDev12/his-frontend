// components/agents/composables/useAgentPagination.js
import { ref, computed } from "vue"

export function useAgentPagination() {
  // État de la pagination
  const pagination = ref({
    page: 1,
    limit: 100,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  })

  // Mettre à jour la pagination depuis l'API
  const updatePagination = (paginationData) => {
    if (paginationData) {
      pagination.value = {
        page: paginationData.page || 1,
        limit: paginationData.limit || 100,
        total: paginationData.total || 0,
        pages: paginationData.pages || 1,
        hasNext: paginationData.hasNext || false,
        hasPrev: paginationData.hasPrev || false
      }
    } else {
      resetPagination()
    }
  }

  // Réinitialiser la pagination
  const resetPagination = () => {
    pagination.value = {
      page: 1,
      limit: 100,
      total: 0,
      pages: 1,
      hasNext: false,
      hasPrev: false
    }
  }

  // Pages visibles pour la navigation
  const visiblePages = computed(() => {
    const current = pagination.value.page
    const total = pagination.value.pages
    const delta = 2
    
    const range = []
    const rangeWithDots = []
    let l
    
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }
    
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })
    
    return rangeWithDots
  })

  return {
    pagination,
    updatePagination,
    resetPagination,
    visiblePages
  }
}