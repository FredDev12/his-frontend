<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  action: {
    type: String,
    default: 'UNKNOWN',
  },
})

const normalized = computed(() => String(props.action || '').toUpperCase())

const variant = computed(() => {
  if (['CREATE', 'LOGIN'].includes(normalized.value)) return 'success'
  if (['UPDATE', 'VALIDATE'].includes(normalized.value)) return 'primary'
  if (['CANCEL', 'LOGOUT'].includes(normalized.value)) return 'warning'
  if (['DELETE', 'RESET_PASSWORD'].includes(normalized.value)) return 'danger'

  return 'neutral'
})

const label = computed(() => {
  const labels = {
    CREATE: 'Création',
    UPDATE: 'Modification',
    DELETE: 'Suppression',
    LOGIN: 'Connexion',
    LOGOUT: 'Déconnexion',
    VALIDATE: 'Validation',
    CANCEL: 'Annulation',
    RESET_PASSWORD: 'Reset mot de passe',
    UNKNOWN: 'Inconnu',
  }

  return labels[normalized.value] || props.action
})
</script>

<template>
  <BaseBadge :variant="variant">
    {{ label }}
  </BaseBadge>
</template>
