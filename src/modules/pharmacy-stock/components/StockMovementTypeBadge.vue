<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'IN',
  },
})

const normalized = computed(() => String(props.type || '').toUpperCase())

const variant = computed(() => {
  if (normalized.value === 'IN') return 'success'
  if (normalized.value === 'OUT') return 'warning'
  if (normalized.value === 'ADJUST') return 'primary'
  if (normalized.value === 'INITIAL') return 'neutral'
  return 'neutral'
})

const label = computed(() => {
  const labels = {
    IN: 'Entrée',
    OUT: 'Sortie',
    ADJUST: 'Ajustement',
    INITIAL: 'Initial',
  }

  return labels[normalized.value] || props.type
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
