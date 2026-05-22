<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'INFO',
  },
})

const normalized = computed(() => String(props.type || '').toUpperCase())

const variant = computed(() => {
  if (normalized.value === 'SUCCESS') return 'success'
  if (normalized.value === 'WARNING') return 'warning'
  if (normalized.value === 'DANGER') return 'danger'
  if (normalized.value === 'EMERGENCY') return 'emergency'

  return 'primary'
})

const label = computed(() => {
  const labels = {
    INFO: 'Information',
    SUCCESS: 'Succès',
    WARNING: 'Attention',
    DANGER: 'Critique',
    EMERGENCY: 'Urgence',
  }

  return labels[normalized.value] || props.type
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
