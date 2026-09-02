<script setup>
import { computed } from 'vue'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  statut: {
    type: String,
    default: 'DEMANDE',
  },
})

const normalized = computed(() =>
  String(props.statut || '').toUpperCase(),
)

const variant = computed(() => {
  if (normalized.value === 'RESULTAT_DISPONIBLE') return 'success'
  if (normalized.value === 'ANNULE') return 'danger'
  if (normalized.value === 'EN_COURS') return 'primary'
  if (normalized.value === 'DEMANDE') return 'warning'
  return 'neutral'
})

const label = computed(() => {
  const labels = {
    DEMANDE: 'Demandé',
    EN_COURS: 'En cours',
    RESULTAT_DISPONIBLE: 'Résultat disponible',
    ANNULE: 'Annulé',
  }

  return labels[normalized.value] || 'Non défini'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
