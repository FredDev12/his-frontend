<script setup>
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  settings: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Hôpital</p>
      <p class="mt-3 text-lg font-semibold text-slate-950">
        {{ settings?.general?.hospital_name || '—' }}
      </p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Devise</p>
      <p class="mt-3 text-lg font-semibold text-slate-950">
        {{ settings?.general?.default_currency || '—' }}
      </p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Modes paiement</p>
      <p class="mt-3 text-lg font-semibold text-slate-950">
        {{ settings?.payment_modes?.length || 0 }}
      </p>
    </article>

    <article class="his-card p-5">
      <p class="text-sm font-medium text-slate-500">Dernière modification</p>
      <p class="mt-3 text-lg font-semibold text-slate-950">
        {{ formatDateTime(settings?.updated_at) }}
      </p>
    </article>
  </section>
</template>
