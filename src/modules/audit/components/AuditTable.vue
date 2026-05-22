<script setup>
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import AuditActionBadge from '@/modules/audit/components/AuditActionBadge.vue'
import AuditEntityBadge from '@/modules/audit/components/AuditEntityBadge.vue'
import { formatDateTime } from '@/shared/utils/date'

defineProps({
  audits: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

function userLabel(audit) {
  return audit.user_nom || audit.user_email || audit.user_id || '—'
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Date
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Utilisateur
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Action
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Entité
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              IP
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des journaux d’audit...
            </td>
          </tr>

          <tr v-else-if="audits.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucun journal d’audit trouvé.
            </td>
          </tr>

          <tr v-for="audit in audits" v-else :key="audit.id" class="hover:bg-slate-50">
            <td class="px-4 py-4 text-sm text-slate-600">
              {{ formatDateTime(audit.created_at) }}
            </td>

            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ userLabel(audit) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">Rôle : {{ audit.role || '—' }}</p>
            </td>

            <td class="px-4 py-4">
              <AuditActionBadge :action="audit.action" />
            </td>

            <td class="px-4 py-4">
              <AuditEntityBadge :entite="audit.entite" />
              <p v-if="audit.entite_id" class="mt-1 text-xs text-slate-500">
                ID : {{ audit.entite_id }}
              </p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ audit.ip || '—' }}
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/audit/${audit.id}`">
                  <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
                </RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        Chargement des journaux d’audit...
      </div>

      <div
        v-else-if="audits.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucun journal d’audit trouvé.
      </div>

      <article
        v-for="audit in audits"
        v-else
        :key="audit.id"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ userLabel(audit) }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{ formatDateTime(audit.created_at) }}
            </p>
          </div>

          <AuditActionBadge :action="audit.action" />
        </div>

        <div class="mt-4 space-y-1 text-sm text-slate-600">
          <p>Entité : {{ audit.entite || '—' }}</p>
          <p>IP : {{ audit.ip || '—' }}</p>
        </div>

        <div class="mt-4">
          <RouterLink :to="`/audit/${audit.id}`">
            <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>
