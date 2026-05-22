<script setup>
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

defineProps({
  context: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: 'Contexte fiche',
  },
})

function dash(value) {
  return value || '—'
}

function fullName(context = {}) {
  return (
    [context.nom, context.postnom, context.prenom].filter(Boolean).join(' ').trim() ||
    'Patient non renseigné'
  )
}
</script>

<template>
  <section v-if="context" class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
    <div class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
      <div>
        <p class="text-sm font-semibold text-blue-950">
          {{ title }}
        </p>

        <p class="mt-1 text-sm text-blue-800">
          {{ fullName(context) }}
        </p>

        <p class="mt-1 text-xs text-blue-700">
          N° Patient : {{ dash(context.numero_patient) }} · N° Fiche :
          {{ dash(context.numero_fiche) }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <BaseBadge variant="primary">
          {{ dash(context.numero_fiche) }}
        </BaseBadge>

        <BaseBadge variant="neutral">
          {{ dash(context.service || context.source_module || 'Workflow') }}
        </BaseBadge>
      </div>
    </div>
  </section>
</template>
