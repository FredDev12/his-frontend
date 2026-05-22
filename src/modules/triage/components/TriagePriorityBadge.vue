<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  priorite: {
    type: String,
    default: 'ROUTINE',
  },
})

const normalized = computed(() => String(props.priorite || '').toUpperCase())

const variant = computed(() => {
  if (normalized.value === 'URGENT') return 'emergency'
  return 'primary'
})

const label = computed(() => {
  if (normalized.value === 'URGENT') return 'Urgent'
  return 'Routine'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
