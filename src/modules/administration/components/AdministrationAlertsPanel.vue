<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const { alerts } = defineProps({
  alerts: {
    type: Array,
    default: () => [],
  },
})

const auditSummary = computed(() => {
  const stored = localStorage.getItem('his_audit_events')

  if (!stored) {
    return {
      total: 0,
      pending: 0,
      synced: 0,
      warnings: 0,
      hasData: false,
    }
  }

  try {
    const items = JSON.parse(stored)
    const audits = Array.isArray(items) ? items : []

    return {
      total: audits.length,
      pending: audits.filter((item) => item.sync_status === 'pending' || item.synced === false)
        .length,
      synced: audits.filter((item) => item.synced === true || item.sync_status === 'synced').length,
      warnings: audits.filter(
        (item) => item.auditLevel === 'WARNING' || item.audit_level === 'WARNING',
      ).length,
      hasData: audits.length > 0,
    }
  } catch {
    return {
      total: 0,
      pending: 0,
      synced: 0,
      warnings: 0,
      hasData: false,
    }
  }
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
      <h2 class="font-semibold text-slate-950">Alertes administratives</h2>

      <p class="mt-1 text-sm text-slate-500">Points de vigilance détectés sur la console HIS.</p>
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-2">
      <article
        v-for="alert in alerts"
        :key="alert.id"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-950">
              {{ alert.title }}
            </p>

            <p class="mt-1 text-sm text-slate-500">
              {{ alert.message }}
            </p>
          </div>

          <BaseBadge :variant="badgeVariant(alert.tone)">
            {{ alert.count }}
          </BaseBadge>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-950">Audit local</p>

            <p class="mt-1 text-sm text-slate-500">
              {{ auditSummary.total }} action(s) tracée(s) localement.
            </p>

            <div class="mt-3 flex flex-wrap gap-2">
              <BaseBadge :variant="auditSummary.pending > 0 ? 'warning' : 'success'">
                {{ auditSummary.pending }} en attente
              </BaseBadge>

              <BaseBadge variant="success"> {{ auditSummary.synced }} synchronisée(s) </BaseBadge>

              <BaseBadge :variant="auditSummary.warnings > 0 ? 'warning' : 'neutral'">
                {{ auditSummary.warnings }} critique(s)
              </BaseBadge>
            </div>
          </div>

          <BaseBadge :variant="auditSummary.hasData ? 'primary' : 'neutral'">
            {{ auditSummary.total }}
          </BaseBadge>
        </div>
      </article>
    </div>
  </section>
</template>
