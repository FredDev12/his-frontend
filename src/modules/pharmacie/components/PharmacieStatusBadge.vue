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
  if (['delivered', 'delivre', 'délivré'].includes(normalized.value)) return 'success'
  if (['partial', 'partiel'].includes(normalized.value)) return 'warning'
  if (['cancelled', 'annule', 'annulé'].includes(normalized.value)) return 'danger'
  if (['pending', 'attente', 'en_attente'].includes(normalized.value)) return 'warning'
  return 'neutral'
})

const label = computed(() => {
  const labels = {
    delivered: 'Délivrée',
    delivre: 'Délivrée',
    délivré: 'Délivrée',
    partial: 'Partielle',
    partiel: 'Partielle',
    pending: 'En attente',
    attente: 'En attente',
    en_attente: 'En attente',
    cancelled: 'Annulée',
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
