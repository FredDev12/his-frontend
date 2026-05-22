<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  reception: {
    type: Object,
    default: null,
  },
})

const variant = computed(() => {
  if (props.reception?.urgence) return 'emergency'
  if (props.reception?.paiement_effectue) return 'success'
  return 'warning'
})

const label = computed(() => {
  if (props.reception?.urgence) return 'Urgence'
  if (props.reception?.paiement_effectue) return 'Payée'
  return 'Paiement en attente'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
