<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ReceptionIdentityCard from '@/modules/receptions/components/ReceptionIdentityCard.vue'

import { useReceptionsStore } from '@/modules/receptions/stores/receptions.store'

const route = useRoute()
const router = useRouter()
const store = useReceptionsStore()

const receptionId = computed(() => route.params.id)
const reception = computed(() => store.selectedReception)

onMounted(async () => {
  try {
    await store.fetchReceptionById(receptionId.value)
  } catch {
    router.push('/receptions')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail réception</h1>

        <p class="his-page-subtitle">Suivi de l’admission, paiement et orientation du patient.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/receptions">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="reception" :to="`/receptions/${reception.id}/edit`">
          <BaseButton> Modifier réception </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la réception...
    </div>

    <div v-else-if="reception" class="space-y-6">
      <ReceptionIdentityCard :reception="reception" />

      <section class="grid gap-6 xl:grid-cols-3">
        <BaseCard
          class="xl:col-span-2"
          title="Orientation"
          subtitle="Étapes suivantes dans le parcours patient."
        >
          <div class="grid gap-4 md:grid-cols-2">
            <RouterLink :to="`/triage?receptionId=${reception.id}`">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                <p class="font-semibold text-slate-900">Envoyer au triage</p>
                <p class="mt-2 text-sm text-slate-500">Signes vitaux et priorité clinique.</p>
              </div>
            </RouterLink>

            <RouterLink :to="`/consultations?receptionId=${reception.id}`">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                <p class="font-semibold text-slate-900">Ouvrir consultation</p>
                <p class="mt-2 text-sm text-slate-500">Consultation médicale initiale.</p>
              </div>
            </RouterLink>
          </div>
        </BaseCard>

        <BaseCard title="Motif de venue" subtitle="Informations déclarées à l’accueil.">
          <p class="text-sm leading-6 text-slate-600">
            {{ reception.motif || 'Aucun motif renseigné.' }}
          </p>
        </BaseCard>
      </section>
    </div>
  </div>
</template>
