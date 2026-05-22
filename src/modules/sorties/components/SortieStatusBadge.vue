<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  statut: {
    type: String,
    default: 'pending',
  },
})

const normalized = computed(() => String(props.statut || '').toLowerCase())

const variant = computed(() => {
  if (['validated', 'valide', 'validé', 'discharged'].includes(normalized.value)) return 'success'
  if (['cancelled', 'annule', 'annulé', 'canceled'].includes(normalized.value)) return 'danger'
  if (['pending', 'attente', 'en_attente'].includes(normalized.value)) return 'warning'
  return 'neutral'
})

const label = computed(() => {
  const labels = {
    validated: 'Sortie validée',
    valide: 'Sortie validée',
    validé: 'Sortie validée',
    discharged: 'Sortie validée',
    pending: 'En attente',
    attente: 'En attente',
    en_attente: 'En attente',
    cancelled: 'Annulée',
    canceled: 'Annulée',
    annule: 'Annulée',
    annulé: 'Annulée',
  }

  return labels[normalized.value] || 'Non défini'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
