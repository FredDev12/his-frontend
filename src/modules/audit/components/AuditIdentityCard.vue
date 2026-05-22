<script setup>
import AuditActionBadge from '@/modules/audit/components/AuditActionBadge.vue'
import AuditEntityBadge from '@/modules/audit/components/AuditEntityBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  audit: {
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
          <h2 class="text-xl font-semibold text-slate-950">Audit #{{ dash(audit.id) }}</h2>

          <AuditActionBadge :action="audit.action" />
          <AuditEntityBadge :entite="audit.entite" />
        </div>

        <p class="mt-2 text-sm text-slate-500">Request ID : {{ dash(audit.request_id) }}</p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {{ formatDateTime(audit.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Utilisateur</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(audit.user_nom || audit.user_email || audit.user_id) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Rôle</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(audit.role) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Entité ID</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(audit.entite_id) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">IP</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(audit.ip) }}</dd>
      </div>
    </dl>
  </section>
</template>
