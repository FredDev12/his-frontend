<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  priority: {
    type: String,
    default: 'normal',
  },
})

const normalized = computed(() => String(props.priority || '').toLowerCase())

const variant = computed(() => {
  if (normalized.value === 'urgent') return 'emergency'
  if (normalized.value === 'high') return 'danger'
  if (normalized.value === 'normal') return 'primary'
  if (normalized.value === 'low') return 'neutral'

  return 'neutral'
})

const label = computed(() => {
  const labels = {
    low: 'Basse',
    normal: 'Normale',
    high: 'Haute',
    urgent: 'Urgente',
  }

  return labels[normalized.value] || props.priority
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
