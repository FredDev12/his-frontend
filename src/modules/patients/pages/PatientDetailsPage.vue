<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import PatientIdentityCard from '@/modules/patients/components/PatientIdentityCard.vue'

import { usePatientsStore } from '@/modules/patients/stores/patients.store'
import { ficheWorkflowService } from '@/shared/services/fiche-workflow.service'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = usePatientsStore()
const toast = useToastStore()

const patientId = computed(() => route.params.id)
const patient = computed(() => store.selectedPatient)

const hasNumeroFiche = computed(() => {
  return Boolean(patient.value?.numero_fiche && patient.value.numero_fiche !== '—')
})

function openWorkflow(path) {
  if (!hasNumeroFiche.value) {
    toast.error('Numéro de fiche introuvable pour ce patient.')
    return
  }

  ficheWorkflowService.setActiveFiche({
    ...patient.value,
    source_module: 'patients',
  })

  router.push(path)
}

onMounted(async () => {
  try {
    await store.fetchPatientById(patientId.value)
  } catch (error) {
    console.error('[Patients] Fiche patient introuvable:', error)
    toast.error(error.message || 'Patient introuvable.')
    router.push('/patients')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Fiche patient</h1>

        <p class="his-page-subtitle">
          Vue détaillée du patient et préparation du parcours clinique.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/patients">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="patient" :to="`/patients/${patient.id}/edit`">
          <BaseButton> Modifier patient </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la fiche patient...
    </div>

    <div v-else-if="patient" class="space-y-6">
      <PatientIdentityCard :patient="patient" />

      <div
        v-if="!hasNumeroFiche"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        Ce patient n’a pas encore de numéro de fiche exploitable. Ouvre d’abord une réception ou
        crée une nouvelle fiche avant de l’envoyer dans le workflow clinique.
      </div>

      <section class="grid gap-6 xl:grid-cols-3">
        <BaseCard
          class="xl:col-span-2"
          title="Parcours patient"
          subtitle="Le workflow utilise le numéro de fiche comme identifiant du passage courant."
        >
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Réceptions / Admissions</p>
              <p class="mt-2 text-sm text-slate-500">Aucun historique chargé.</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Consultations</p>
              <p class="mt-2 text-sm text-slate-500">Aucun historique chargé.</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Examens</p>
              <p class="mt-2 text-sm text-slate-500">Aucun examen chargé.</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="font-semibold text-slate-900">Paiements</p>
              <p class="mt-2 text-sm text-slate-500">Aucun paiement chargé.</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Actions workflow" subtitle="Envoyer la fiche courante vers un module.">
          <div class="space-y-3">
            <BaseButton
              class="w-full justify-start"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/receptions/create')"
            >
              Créer réception
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/triage/create')"
            >
              Envoyer au triage
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/consultations/create')"
            >
              Ouvrir consultation
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/laboratoire/create')"
            >
              Demande laboratoire
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/imagerie/create')"
            >
              Demande imagerie
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/pharmacie/create')"
            >
              Prescription pharmacie
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/caisse/create')"
            >
              Paiement caisse
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/facturation/create')"
            >
              Facturation
            </BaseButton>

            <BaseButton
              class="w-full justify-start"
              variant="secondary"
              :disabled="!hasNumeroFiche"
              @click="openWorkflow('/sorties/create')"
            >
              Préparer sortie
            </BaseButton>
          </div>
        </BaseCard>
      </section>
    </div>
  </div>
</template>
