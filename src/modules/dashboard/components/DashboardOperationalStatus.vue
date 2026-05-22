<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

defineProps({
  alerts: {
    type: Array,
    default: () => [],
  },
  hasPartialErrors: {
    type: Boolean,
    default: false,
  },
})

function badgeVariant(tone) {
  if (tone === 'danger') return 'danger'
  if (tone === 'warning') return 'warning'
  if (tone === 'success') return 'success'
  return 'primary'
}
</script>

<template>
  <section class="his-card p-5">
    <div>
      <h2 class="font-semibold text-slate-950">État opérationnel</h2>

      <p class="mt-1 text-sm text-slate-500">Points de vigilance du workflow hospitalier.</p>
    </div>

    <div
      v-if="hasPartialErrors"
      class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Certains modules n’ont pas répondu. Les indicateurs peuvent être partiels.
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-2">
      <article
        v-for="alert in alerts"
        :key="alert.key"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-950">
              {{ alert.label }}
            </p>

            <p class="mt-1 text-sm text-slate-500">
              {{ alert.description }}
            </p>
          </div>

          <BaseBadge :variant="badgeVariant(alert.tone)">
            {{ alert.value }}
          </BaseBadge>
        </div>

        <div class="mt-4">
          <RouterLink :to="alert.to">
            <BaseButton variant="secondary" size="sm"> Consulter </BaseButton>
          </RouterLink>
        </div>
      </article>
    </div>
  </section>
</template>
