<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import SortieIdentityCard from '@/modules/sorties/components/SortieIdentityCard.vue'

import { useSortiesStore } from '@/modules/sorties/stores/sorties.store'

const route = useRoute()
const router = useRouter()
const store = useSortiesStore()

const sortieId = computed(() => route.params.id)
const sortie = computed(() => store.selectedSortie)

onMounted(async () => {
  try {
    await store.fetchSortieById(sortieId.value)
  } catch {
    router.push('/sorties')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail sortie patient</h1>

        <p class="his-page-subtitle">Résumé médical, consignes et statut de clôture.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/sorties">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="sortie" :to="`/sorties/${sortie.id}/edit`">
          <BaseButton> Modifier sortie </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la sortie...
    </div>

    <div v-else-if="sortie" class="space-y-6">
      <SortieIdentityCard :sortie="sortie" />

      <section class="grid gap-6 xl:grid-cols-2">
        <BaseCard title="Résumé médical" subtitle="Synthèse médicale au moment de la sortie.">
          <p class="text-sm leading-6 text-slate-600">
            {{ sortie.resume_medical || '—' }}
          </p>
        </BaseCard>

        <BaseCard title="Consignes de sortie" subtitle="Recommandations données au patient.">
          <p class="text-sm leading-6 text-slate-600">
            {{ sortie.consignes || '—' }}
          </p>
        </BaseCard>

        <BaseCard title="Motif de sortie" subtitle="Raison de clôture du passage.">
          <p class="text-sm leading-6 text-slate-600">
            {{ sortie.motif_sortie || '—' }}
          </p>
        </BaseCard>

        <BaseCard title="Destination" subtitle="Orientation après sortie.">
          <p class="text-sm leading-6 text-slate-600">
            {{ sortie.destination || '—' }}
          </p>
        </BaseCard>
      </section>
    </div>
  </div>
</template>
