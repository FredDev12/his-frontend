<script setup>
import { watch, ref } from "vue"
import { useReceptionWizard } from "./composables/useReceptionWizard"
import { useReceptionStore } from "../../stores/reception.store"

import PrintFiche from "../../components/print/PrintFiche.vue"
import ReceptionHeader from "./components/ReceptionHeader.vue"
import ReceptionStepper from "./components/ReceptionStepper.vue"
import StepType from "./components/StepType.vue"
import StepSearch from "./components/StepSearch.vue"
import StepAgentFamily from "./components/StepAgentFamily.vue"
import StepPayment from "./components/StepPayment.vue"
import StepAlreadyPaid from "./components/StepAlreadyPaid.vue"
import StepForm from "./components/StepForm.vue"

const reception = useReceptionStore()
const wizard = useReceptionWizard()

const showPrintModal = ref(false)
const lastSavedPatient = ref(null)
const lastReceptionData = ref({})

const handleSaved = (event) => {
  wizard.resetFlow()
  
  if (event.patient) {
    lastSavedPatient.value = event.patient
    lastReceptionData.value = event.receptionData || {}
    showPrintModal.value = true
  }
}

const handleUpdateTypedChildName = (value) => {
  wizard.typedChildName.value = value
}

// Watch pour le changement de type patient
watch(() => wizard.patientType.value, (val) => {
  wizard.watchPatientType(val)
})

// Charger le draft au montage
watch(wizard, () => {
  if (reception.loadDraft) reception.loadDraft()
}, { immediate: true })

console.log("reception patien type", wizard.patientType)
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <ReceptionHeader />
    
    <ReceptionStepper
      v-model:step="wizard.step.value"
      :totalSteps="wizard.totalSteps.value"
      :stepTitle="wizard.stepTitle.value"
      :stepDescription="wizard.stepDescription.value"
      :patientType="wizard.patientType.value"
      :requiresPayment="wizard.requiresPayment.value"
      :paymentOk="wizard.paymentOk.value"
      :receptionDraft="reception.draft"
    />

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <!-- STEP 1: TYPE -->
      <StepType
        v-if="wizard.step.value === 1"
        v-model:patientType="wizard.patientType.value"
        @next="wizard.goNext()"
      />

      <!-- STEP 2: SEARCH -->
      <StepSearch
        v-if="wizard.step.value === 2"
        :patientType="wizard.patientType.value"
        :selectedAgent="wizard.selectedAgent.value"
        :selectedPatient="wizard.selectedPatient.value"
        @selectAgent="wizard.handleAgent"
        @selectPatient="wizard.handlePatient"
        @next="wizard.goNext()"
        @back="wizard.goBack()"
      />

      <!-- STEP 3: AGENT FAMILY -->
      <StepAgentFamily
        v-if="wizard.step.value === 3 && wizard.patientType.value === 'agent'"
        :selectedAgent="wizard.selectedAgent.value"
        :selectedPatient="wizard.selectedPatient.value"
        :patientType="wizard.patientType.value"
        :relation="wizard.relation.value"
        :typedChildName="wizard.typedChildName.value"
        :existingMatches="wizard.existingMatches.value"
        :checkingExisting="wizard.checkingExisting.value"
        :openingPatient="wizard.openingPatient.value"
        @update:typedChildName="handleUpdateTypedChildName"
        @chooseRelation="wizard.chooseRelation"
        @checkExisting="wizard.checkExisting"
        @handlePatient="wizard.handlePatient"
        @forceCreateNew="wizard.forceCreateNew"
        @next="wizard.goNext()"
      />

      <!-- STEP 3: PUBLIC PAYMENT -->
      <StepPayment
        v-if="wizard.step.value === 3 && wizard.patientType.value === 'public' && wizard.paymentRequiredNow.value"
        :paymentOk="wizard.paymentOk.value"
        @next="wizard.goNext()"
        @back="wizard.goBack()"
      />

      <!-- STEP 3: ALREADY PAID -->
      <StepAlreadyPaid
        v-if="wizard.step.value === 3 && wizard.patientType.value === 'agent' && !wizard.paymentRequiredNow.value"
        @next="wizard.step.value = 4"
        @back="wizard.goBack()"
      />

      <!-- STEP 4: FORM -->
      <StepForm
        v-if="wizard.step.value === 4"
        :patientType="wizard.patientType.value"
        :selectedAgent="wizard.selectedAgent.value"
        :selectedPatient="wizard.selectedPatient.value"
        :relation="wizard.relation.value"
        :typedChildName="wizard.typedChildName.value"
        @saved="wizard.resetFlow()"
      />
    </div>

    <!-- Modal d'impression -->
    <div v-if="showPrintModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 class="text-lg font-semibold">Fiche de réception</h2>
          <button @click="showPrintModal = false" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div class="p-6">
          <PrintFiche 
            :patient="lastSavedPatient"
            :reception-data="lastReceptionData"
            :show-print-button="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>