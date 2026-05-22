<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  statut: {
    type: String,
    default: 'scheduled',
  },
})

const normalized = computed(() => String(props.statut || '').toLowerCase())

const variant = computed(() => {
  if (normalized.value === 'scheduled') return 'primary'
  if (normalized.value === 'confirmed') return 'success'
  if (normalized.value === 'completed') return 'neutral'
  if (normalized.value === 'cancelled') return 'danger'

  return 'neutral'
})

const label = computed(() => {
  const labels = {
    scheduled: 'Programmé',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  }

  return labels[normalized.value] || 'Non défini'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
