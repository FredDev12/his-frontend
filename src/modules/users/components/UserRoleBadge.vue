<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  role: {
    type: String,
    default: 'patient',
  },
})

const normalized = computed(() => String(props.role || '').toLowerCase())

const variant = computed(() => {
  if (normalized.value === 'admin') return 'danger'
  if (normalized.value === 'medecin') return 'primary'
  if (normalized.value === 'secretaire') return 'warning'
  if (normalized.value === 'patient') return 'neutral'

  return 'neutral'
})

const label = computed(() => {
  const labels = {
    admin: 'Administrateur',
    medecin: 'Médecin',
    secretaire: 'Secrétaire',
    patient: 'Patient',
  }

  return labels[normalized.value] || props.role
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
