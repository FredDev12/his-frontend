<script setup>
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

import BaseCard from "@/shared/ui/base/BaseCard.vue"
import BaseButton from "@/shared/ui/base/BaseButton.vue"

import PatientHeader from "@/modules/dme/components/PatientHeader.vue"
import ClinicalSummaryCard from "@/modules/dme/components/ClinicalSummaryCard.vue"
import EpisodeTimeline from "@/modules/dme/components/EpisodeTimeline.vue"
import MedicalTabs from "@/modules/dme/components/MedicalTabs.vue"
import ConsultationsTab from "@/modules/dme/components/ConsultationsTab.vue"
import ExamensTab from "@/modules/dme/components/ExamensTab.vue"
import PrescriptionsTab from "@/modules/dme/components/PrescriptionsTab.vue"
import FacturationTab from "@/modules/dme/components/FacturationTab.vue"
import PaiementsTab from "@/modules/dme/components/PaiementsTab.vue"
import HospitalisationTab from "@/modules/dme/components/HospitalisationTab.vue"
import AuditTab from "@/modules/dme/components/AuditTab.vue"

import { useDmeStore } from "@/modules/dme/stores/dme.store"
import { useToastStore } from "@/shared/stores/toast.store"

const route = useRoute()
const store = useDmeStore()
const toast = useToastStore()

const activeTab = ref("resume")
const patientId = computed(() => route.params.patientId)

async function load() {
  if (!patientId.value) return

  try {
    await store.loadMedicalRecord(patientId.value)
  } catch (error) {
    toast.error(error.response?.data?.message || "DME indisponible.")
  }
}

load()
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Dossier Médical Électronique</h1>
        <p class="his-page-subtitle">Vue clinique unifiée du parcours patient.</p>
      </div>

      <BaseButton variant="secondary" :loading="store.loading" @click="load">
        Actualiser
      </BaseButton>
    </header>

    <div v-if="store.error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ store.error }}
    </div>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement du dossier médical...
    </div>

    <template v-else>
      <PatientHeader :patient="store.patient" :episode="store.episode" />

      <ClinicalSummaryCard :summary="store.summary" />

      <BaseCard title="Timeline clinique" subtitle="Parcours chronologique du patient.">
        <EpisodeTimeline :events="store.timeline" />
      </BaseCard>

      <BaseCard title="Données médicales" subtitle="Informations agrégées par module.">
        <MedicalTabs :active-tab="activeTab" @change="activeTab = $event" />

        <div class="mt-5">
          <div v-if="activeTab === 'resume'" class="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
            Résumé clinique : {{ store.summary?.diagnostic || "Aucun résumé chargé." }}
          </div>

          <ConsultationsTab v-else-if="activeTab === 'consultations'" :consultations="store.consultations" />
          <ExamensTab v-else-if="activeTab === 'examens'" :examens="store.examens" />
          <PrescriptionsTab v-else-if="activeTab === 'prescriptions'" :prescriptions="store.prescriptions" />
          <FacturationTab v-else-if="activeTab === 'facturation'" :factures="store.factures" />
          <PaiementsTab v-else-if="activeTab === 'paiements'" :paiements="store.paiements" />
          <HospitalisationTab v-else-if="activeTab === 'hospitalisation'" :hospitalisations="store.hospitalisations" />
          <AuditTab v-else-if="activeTab === 'audit'" :audit="store.audit" />
        </div>
      </BaseCard>
    </template>
  </div>
</template>

