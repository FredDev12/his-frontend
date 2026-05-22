<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  entite: {
    type: String,
    default: '',
  },
})

const label = computed(() => props.entite || '—')
</script>

<template>
  <BaseBadge variant="neutral">
    {{ label }}
  </BaseBadge>
</template>
