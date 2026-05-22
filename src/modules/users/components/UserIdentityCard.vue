<script setup>
import UserRoleBadge from '@/modules/users/components/UserRoleBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  user: {
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
            {{ dash(user.nom) }} {{ dash(user.prenom) }}
          </h2>

          <UserRoleBadge :role="user.role" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          {{ dash(user.email) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        ID utilisateur : {{ dash(user.id) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Rôle</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(user.role) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Email</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(user.email) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Créé le</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(user.created_at) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Modifié le</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ formatDateTime(user.updated_at) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
