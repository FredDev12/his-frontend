<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import ServiceIdentityCard from '@/modules/services/components/ServiceIdentityCard.vue'

import { useHospitalServicesStore } from '@/modules/services/stores/services.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useHospitalServicesStore()
const toast = useToastStore()

const serviceId = computed(() => route.params.id)
const service = computed(() => store.selectedService)

onMounted(async () => {
  try {
    await store.fetchServiceById(serviceId.value)
  } catch (error) {
    console.error('[Services] Service introuvable:', error)
    toast.error(error.message || 'Service introuvable.')
    router.push('/services')
  }
})

function formatMoney(value, devise = 'CDF') {
  return `${Number(value || 0).toLocaleString('fr-FR')} ${devise}`
}

function moduleLabel(value) {
  const labels = {
    reception: 'Réception',
    consultations: 'Consultations',
    laboratoire: 'Laboratoire',
    imagerie: 'Imagerie',
    pharmacie: 'Pharmacie',
    caisse: 'Caisse',
    facturation: 'Facturation',
    sorties: 'Sorties',
    autre: 'Autre',
  }

  return labels[value] || value || '—'
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail service hospitalier</h1>

        <p class="his-page-subtitle">
          Informations du service, tarification, remise, visibilité et statut.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/services">
          <BaseButton variant="secondary">Retour</BaseButton>
        </RouterLink>

        <RouterLink v-if="service" :to="`/services/${service.id}/edit`">
          <BaseButton>Modifier service</BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du service...
    </div>

    <div v-else-if="service" class="space-y-6">
      <ServiceIdentityCard :service="service" />

      <BaseCard
        title="Prix et facturation"
        subtitle="Configuration financière du service ou module."
      >
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Prix de base</p>

            <p class="mt-1 text-lg font-bold text-slate-950">
              {{ formatMoney(service.prix_base, service.devise) }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
              Remise autorisée
            </p>

            <div class="mt-2">
              <BaseBadge :variant="service.remise_autorisee ? 'success' : 'neutral'">
                {{ service.remise_autorisee ? 'Oui' : 'Non' }}
              </BaseBadge>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
              Remise maximale
            </p>

            <p class="mt-1 text-sm font-semibold text-slate-900">{{ service.remise_max }} %</p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
              Paiement requis
            </p>

            <div class="mt-2">
              <BaseBadge :variant="service.necessite_paiement ? 'warning' : 'success'">
                {{ service.necessite_paiement ? 'Oui' : 'Non' }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Visibilité du service" subtitle="Modules où ce service peut être utilisé.">
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Module source</p>

            <p class="mt-1 text-sm font-semibold text-slate-900">
              {{ moduleLabel(service.module_source) }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
              Visible dans facturation
            </p>

            <div class="mt-2">
              <BaseBadge :variant="service.visible_dans_facturation ? 'primary' : 'neutral'">
                {{ service.visible_dans_facturation ? 'Oui' : 'Non' }}
              </BaseBadge>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
              Visible dans réception
            </p>

            <div class="mt-2">
              <BaseBadge :variant="service.visible_dans_reception ? 'primary' : 'neutral'">
                {{ service.visible_dans_reception ? 'Oui' : 'Non' }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Description" subtitle="Rôle du service dans le workflow hospitalier.">
        <p class="text-sm leading-6 text-slate-600">
          {{ service.description || '—' }}
        </p>
      </BaseCard>
    </div>
  </div>
</template>
