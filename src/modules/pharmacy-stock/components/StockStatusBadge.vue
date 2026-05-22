<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const variant = computed(() => {
  if (props.product.stock_state === 'out') return 'danger'
  if (props.product.stock_state === 'low') return 'warning'
  if (props.product.statut !== 'active') return 'neutral'
  return 'success'
})

const label = computed(() => {
  if (props.product.stock_state === 'out') return 'Rupture'
  if (props.product.stock_state === 'low') return 'Stock faible'
  if (props.product.statut !== 'active') return 'Inactif'
  return 'Disponible'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
