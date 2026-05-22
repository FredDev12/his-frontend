<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  statut: {
    type: String,
    default: 'draft',
  },
})

const normalized = computed(() => String(props.statut || '').toLowerCase())

const variant = computed(() => {
  if (normalized.value === 'draft') return 'neutral'
  if (normalized.value === 'issued') return 'primary'
  if (normalized.value === 'paid') return 'success'
  if (normalized.value === 'cancelled') return 'danger'

  return 'neutral'
})

const label = computed(() => {
  const labels = {
    draft: 'Brouillon',
    issued: 'Émise',
    paid: 'Payée',
    cancelled: 'Annulée',
  }

  return labels[normalized.value] || 'Non défini'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
