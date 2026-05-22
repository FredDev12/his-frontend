<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  statut: {
    type: String,
    default: 'active',
  },
})

const normalized = computed(() => String(props.statut || '').toLowerCase())

const variant = computed(() => {
  if (['active', 'en_cours', 'en cours'].includes(normalized.value)) return 'primary'
  if (['terminee', 'terminée', 'completed'].includes(normalized.value)) return 'success'
  if (['annulee', 'annulée', 'cancelled'].includes(normalized.value)) return 'danger'
  return 'neutral'
})

const label = computed(() => {
  const labels = {
    active: 'En cours',
    en_cours: 'En cours',
    'en cours': 'En cours',
    terminee: 'Terminée',
    terminée: 'Terminée',
    completed: 'Terminée',
    annulee: 'Annulée',
    annulée: 'Annulée',
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
