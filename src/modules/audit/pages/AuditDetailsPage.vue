<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import AuditIdentityCard from '@/modules/audit/components/AuditIdentityCard.vue'
import AuditDiffViewer from '@/modules/audit/components/AuditDiffViewer.vue'

import { useAuditStore } from '@/modules/audit/stores/audit.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useAuditStore()
const toast = useToastStore()

const auditId = computed(() => route.params.id)
const audit = computed(() => store.selectedAudit)

onMounted(async () => {
  try {
    await store.fetchAuditById(auditId.value)
  } catch (error) {
    console.error('[Audit] Introuvable:', error)
    toast.error(error.response?.data?.message || 'Audit introuvable.')
    router.push('/audit')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail audit</h1>

        <p class="his-page-subtitle">
          Reconstitution d’une action sensible : utilisateur, contexte et changement.
        </p>
      </div>

      <RouterLink to="/audit">
        <BaseButton variant="secondary"> Retour </BaseButton>
      </RouterLink>
    </header>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de l’audit...
    </div>

    <div v-else-if="audit" class="space-y-6">
      <AuditIdentityCard :audit="audit" />

      <AuditDiffViewer :old-value="audit.ancienne_valeur" :new-value="audit.nouvelle_valeur" />

      <BaseCard
        title="Contexte technique"
        subtitle="Informations utiles pour reconstituer un incident."
      >
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">User-Agent</p>
            <p class="mt-1 break-words text-sm font-semibold text-slate-900">
              {{ audit.user_agent || '—' }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Request ID</p>
            <p class="mt-1 break-words text-sm font-semibold text-slate-900">
              {{ audit.request_id || '—' }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">
              {{ audit.description || '—' }}
            </p>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
