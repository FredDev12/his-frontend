<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import CaisseIdentityCard from '@/modules/caisse/components/CaisseIdentityCard.vue'

import { useCaisseStore } from '@/modules/caisse/stores/caisse.store'

const route = useRoute()
const router = useRouter()
const store = useCaisseStore()

const paiementId = computed(() => route.params.id)
const paiement = computed(() => store.selectedPaiement)

onMounted(async () => {
  try {
    await store.fetchPaiementById(paiementId.value)
  } catch {
    router.push('/caisse')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail paiement</h1>

        <p class="his-page-subtitle">Informations de paiement, référence et statut caisse.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/caisse">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="paiement" :to="`/caisse/${paiement.id}/edit`">
          <BaseButton> Modifier paiement </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du paiement...
    </div>

    <div v-else-if="paiement" class="space-y-6">
      <CaisseIdentityCard :paiement="paiement" />

      <BaseCard title="Détails paiement" subtitle="Motif, référence et informations associées.">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Patient</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ paiement.nom }} {{ paiement.postnom }} {{ paiement.prenom }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Motif</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ paiement.motif || '—' }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Réception</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ paiement.reception_id || '—' }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Facture</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ paiement.facture_id || '—' }}
            </p>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
