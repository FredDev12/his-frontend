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
  if (['paid', 'paye', 'payé', 'valide', 'validé'].includes(normalized.value)) return 'success'
  if (['cancelled', 'annule', 'annulé', 'canceled'].includes(normalized.value)) return 'danger'
  if (['pending', 'attente', 'en_attente'].includes(normalized.value)) return 'warning'
  return 'neutral'
})

const label = computed(() => {
  const labels = {
    paid: 'Payé',
    paye: 'Payé',
    payé: 'Payé',
    valide: 'Validé',
    validé: 'Validé',
    pending: 'En attente',
    attente: 'En attente',
    en_attente: 'En attente',
    cancelled: 'Annulé',
    canceled: 'Annulé',
    annule: 'Annulé',
    annulé: 'Annulé',
  }

  return labels[normalized.value] || 'Non défini'
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
