<script setup>
import { computed } from 'vue'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import { triagePriorityPresentation } from '@/modules/triage/workflow/triage-create.workflow'

const props = defineProps({
  priorite: { type: String, default: '' },
})

const normalized = computed(() => String(props.priorite || '').toUpperCase())
const presentation = computed(() => triagePriorityPresentation(normalized.value))
const variant = computed(() => {
  if (normalized.value === 'VITALE') return 'emergency'
  if (normalized.value === 'TRES_URGENT') return 'danger'
  if (normalized.value === 'URGENT') return 'warning'
  if (normalized.value === 'ROUTINE') return 'success'
  return 'neutral'
})
</script>

<template>
  <BaseBadge :variant="variant">{{ presentation.label }}</BaseBadge>
</template>
