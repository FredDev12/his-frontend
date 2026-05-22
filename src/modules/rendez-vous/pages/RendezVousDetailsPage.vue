<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import RendezVousIdentityCard from '@/modules/rendez-vous/components/RendezVousIdentityCard.vue'

import { useRendezVousStore } from '@/modules/rendez-vous/stores/rendezvous.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { formatDateTime } from '@/shared/utils/date'

const route = useRoute()
const router = useRouter()
const store = useRendezVousStore()
const toast = useToastStore()

const rdvId = computed(() => route.params.id)
const rdv = computed(() => store.selectedRendezVous)

onMounted(async () => {
  try {
    await store.fetchRendezVousById(rdvId.value)
  } catch (error) {
    toast.error(error.message || 'Rendez-vous introuvable.')
    router.push('/rendez-vous')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail rendez-vous</h1>

        <p class="his-page-subtitle">Informations du patient, service, date, motif et statut.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/rendez-vous">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="rdv" :to="`/rendez-vous/${rdv.id}/edit`">
          <BaseButton> Modifier rendez-vous </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du rendez-vous...
    </div>

    <div v-else-if="rdv" class="space-y-6">
      <RendezVousIdentityCard :rdv="rdv" />

      <BaseCard title="Motif et notes" subtitle="Contexte de planification du rendez-vous.">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Motif</p>
            <p class="mt-1 font-semibold text-slate-900">{{ rdv.motif || '—' }}</p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Modifié le</p>
            <p class="mt-1 font-semibold text-slate-900">{{ formatDateTime(rdv.updated_at) }}</p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
            <p class="mt-1 text-sm leading-6 text-slate-700">{{ rdv.notes || '—' }}</p>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
