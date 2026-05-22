<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConsultationIdentityCard from '@/modules/consultations/components/ConsultationIdentityCard.vue'

import { useConsultationsStore } from '@/modules/consultations/stores/consultations.store'

const route = useRoute()
const router = useRouter()
const store = useConsultationsStore()

const consultationId = computed(() => route.params.id)
const consultation = computed(() => store.selectedConsultation)

onMounted(async () => {
  try {
    await store.fetchConsultationById(consultationId.value)
  } catch {
    router.push('/consultations')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail consultation</h1>

        <p class="his-page-subtitle">Données médicales de la consultation.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/consultations">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="consultation" :to="`/consultations/${consultation.id}/edit`">
          <BaseButton> Modifier consultation </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la consultation...
    </div>

    <div v-else-if="consultation" class="space-y-6">
      <ConsultationIdentityCard :consultation="consultation" />

      <section class="grid gap-6 xl:grid-cols-2">
        <BaseCard title="PGAD" subtitle="Plaintes, histoire, antécédents et déroulement.">
          <div class="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              <strong class="text-slate-900">Plaintes :</strong> {{ consultation.plaintes || '—' }}
            </p>
            <p>
              <strong class="text-slate-900">Histoire :</strong> {{ consultation.histoire || '—' }}
            </p>
            <p>
              <strong class="text-slate-900">Antécédents :</strong>
              {{ consultation.antecedents || '—' }}
            </p>
            <p>
              <strong class="text-slate-900">Déroulement :</strong>
              {{ consultation.deroulement || '—' }}
            </p>
          </div>
        </BaseCard>

        <BaseCard title="Examen médical" subtitle="État général, anamnèse et examen clinique.">
          <div class="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              <strong class="text-slate-900">État général :</strong>
              {{ consultation.etat_general || '—' }}
            </p>
            <p>
              <strong class="text-slate-900">Anamnèse :</strong> {{ consultation.anamnese || '—' }}
            </p>
            <p>
              <strong class="text-slate-900">Examen clinique :</strong>
              {{ consultation.examen_clinique || '—' }}
            </p>
          </div>
        </BaseCard>

        <BaseCard title="Diagnostic" subtitle="Conclusion médicale.">
          <p class="text-sm leading-6 text-slate-600">
            {{ consultation.diagnostique || '—' }}
          </p>
        </BaseCard>

        <BaseCard title="Plan de prise en charge" subtitle="Conduite à tenir.">
          <p class="text-sm leading-6 text-slate-600">
            {{ consultation.plan_prise_en_charge || '—' }}
          </p>
        </BaseCard>
      </section>

      <BaseCard
        title="Actions suivantes"
        subtitle="La consultation prépare les modules examens, pharmacie et sortie."
      >
        <div class="grid gap-4 md:grid-cols-3">
          <RouterLink :to="`/laboratoire?consultationId=${consultation.id}`">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Demander laboratoire</p>
              <p class="mt-2 text-sm text-slate-500">Créer une demande d’examens biologiques.</p>
            </div>
          </RouterLink>

          <RouterLink :to="`/imagerie?consultationId=${consultation.id}`">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Demander imagerie</p>
              <p class="mt-2 text-sm text-slate-500">Créer une demande d’imagerie médicale.</p>
            </div>
          </RouterLink>

          <RouterLink :to="`/pharmacie?consultationId=${consultation.id}`">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
              <p class="font-semibold text-slate-900">Prescrire médicaments</p>
              <p class="mt-2 text-sm text-slate-500">Préparer une prescription médicale.</p>
            </div>
          </RouterLink>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
