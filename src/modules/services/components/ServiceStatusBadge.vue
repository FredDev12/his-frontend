<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  statut: {
    type: String,
    default: 'active',
  },
})

const normalized = computed(() => String(props.statut || '').toLowerCase())

const variant = computed(() => {
  if (normalized.value === 'active') return 'success'
  if (normalized.value === 'inactive') return 'warning'
  if (normalized.value === 'archived') return 'danger'

  return 'neutral'
})

const label = computed(() => {
  const labels = {
    active: 'Actif',
    inactive: 'Inactif',
    archived: 'Archivé',
  }

  return labels[normalized.value] || 'Non défini'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
