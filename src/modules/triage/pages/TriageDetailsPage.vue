<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import TriageIdentityCard from '@/modules/triage/components/TriageIdentityCard.vue'

import { useTriageStore } from '@/modules/triage/stores/triage.store'

const route = useRoute()
const router = useRouter()
const store = useTriageStore()

const triageId = computed(() => route.params.id)
const triage = computed(() => store.selectedTriage)

onMounted(async () => {
  try {
    await store.fetchTriageById(triageId.value)
  } catch {
    router.push('/triage')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail triage</h1>

        <p class="his-page-subtitle">
          Informations de triage, signes vitaux et orientation clinique.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/triage">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="triage" :to="`/triage/${triage.id}/edit`">
          <BaseButton> Modifier triage </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du triage...
    </div>

    <div v-else-if="triage" class="space-y-6">
      <TriageIdentityCard :triage="triage" />

      <BaseCard title="Orientation médicale" subtitle="Étapes suivantes du parcours patient.">
        <div class="grid gap-4 md:grid-cols-2">
          <RouterLink :to="`/consultations?triageId=${triage.id}`">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Envoyer en consultation</p>
              <p class="mt-2 text-sm text-slate-500">Le médecin prend la suite du dossier.</p>
            </div>
          </RouterLink>

          <RouterLink :to="`/laboratoire?triageId=${triage.id}`">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Préparer examens</p>
              <p class="mt-2 text-sm text-slate-500">
                Demandes labo ou imagerie après consultation.
              </p>
            </div>
          </RouterLink>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
