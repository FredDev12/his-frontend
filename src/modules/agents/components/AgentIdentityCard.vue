<script setup>
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  agent: {
    type: Object,
    required: true,
  },
})

function dash(value) {
  return value || '—'
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ dash(agent.nom_post) }} {{ dash(agent.prenom) }}
          </h2>

          <BaseBadge variant="primary">
            {{ dash(agent.fonction) }}
          </BaseBadge>
        </div>

        <p class="mt-2 text-sm text-slate-500">
          CAC ID {{ dash(agent.cac_id_co) }} · Site {{ dash(agent.site) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Téléphone : {{ dash(agent.telephone) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Sexe</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(agent.sexe) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Nationalité</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(agent.nationalite) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Date naissance</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(agent.date_de_naissance) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Statut marital</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(agent.statut_marital) }}</dd>
      </div>
    </dl>
  </section>
</template>
