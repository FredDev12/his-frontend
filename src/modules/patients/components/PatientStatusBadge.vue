<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  status: {
    type: String,
    default: 'actif',
  },
})

const normalized = computed(() => String(props.status || '').toLowerCase())

const variant = computed(() => {
  if (['actif', 'active'].includes(normalized.value)) return 'success'
  if (['inactif', 'inactive'].includes(normalized.value)) return 'warning'
  if (['archivé', 'archive', 'archived'].includes(normalized.value)) return 'neutral'
  if (['décédé', 'decede', 'deceased'].includes(normalized.value)) return 'danger'

  return 'neutral'
})

const label = computed(() => {
  if (!props.status) return 'Non défini'

  return String(props.status)
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
