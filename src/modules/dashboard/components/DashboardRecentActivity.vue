<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="his-card p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="font-semibold text-slate-950">Activité récente</h2>

        <p class="mt-1 text-sm text-slate-500">Dernières opérations patient, caisse et sortie.</p>
      </div>
    </div>

    <div class="mt-5 space-y-3">
      <div
        v-if="activities.length === 0"
        class="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500"
      >
        Aucune activité récente.
      </div>

      <article
        v-for="activity in activities"
        v-else
        :key="activity.id"
        class="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
      >
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <BaseBadge variant="neutral">
              {{ activity.module }}
            </BaseBadge>

            <p class="font-semibold text-slate-950">
              {{ activity.title }}
            </p>
          </div>

          <p class="mt-1 text-sm text-slate-600">
            {{ activity.description }}
          </p>

          <p class="mt-1 text-xs text-slate-400">
            {{ formatDateTime(activity.date) }}
          </p>
        </div>

        <RouterLink v-if="activity.to" :to="activity.to">
          <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
        </RouterLink>
      </article>
    </div>
  </section>
</template>
