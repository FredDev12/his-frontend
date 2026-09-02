<script setup>
import { computed } from 'vue'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  reception: {
    type: Object,
    default: null,
  },
  status: {
    type: String,
    default: '',
  },
})

const resolvedStatus = computed(
  () => props.status || props.reception?.status || props.reception?.statut || '',
)

function statusLabel(status) {
  const map = {
    ADMIS: 'Admis',
    EN_ATTENTE_PAIEMENT: 'Paiement en attente',
    BROUILLON: 'Brouillon',
    ANNULE: 'Annulée',
    ANNULEE: 'Annulée',
  }

  return map[status] || status || '—'
}

function statusVariant(status) {
  if (status === 'ADMIS') return 'success'
  if (status === 'EN_ATTENTE_PAIEMENT') return 'warning'
  if (status === 'ANNULE' || status === 'ANNULEE') return 'danger'
  return 'primary'
}
</script>

<template>
  <BaseBadge :variant="statusVariant(resolvedStatus)">
    {{ statusLabel(resolvedStatus) }}
  </BaseBadge>
</template>
