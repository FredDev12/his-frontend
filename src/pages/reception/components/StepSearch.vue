<script setup>
import AgentSearch from "../../../modules/reception/components/agents/AgentSearch.vue"
import PatientSearch from "../../../modules/reception/components/PatientSearch.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"

const props = defineProps({
  patientType: String,
  selectedAgent: Object,
  selectedPatient: Object
})

const emit = defineEmits(["selectAgent", "selectPatient", "next", "back"])
</script>

<template>
  <div class="space-y-6">
    <!-- Agent -->
    <div v-if="patientType === 'agent'" class="space-y-6">
      <AgentSearch @selectAgent="$emit('selectAgent', $event)" />

      <div v-if="selectedAgent" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
          <div>
            <p class="font-medium text-green-800">Agent sélectionné</p>
            <p class="text-sm text-green-600">{{ selectedAgent.nom_post }} ({{ selectedAgent.cac_id_co }})</p>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <BaseButton variant="primary" @click="$emit('back')">⟵ Retour</BaseButton>
        <BaseButton variant="primary" @click="$emit('next')" :disabled="!selectedAgent">
          Continuer →
        </BaseButton>
      </div>
    </div>

    <!-- Patient public -->
    <div v-else class="space-y-6">
      <PatientSearch @selectPatient="$emit('selectPatient', $event)" />

      <div v-if="selectedPatient" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
          <div>
            <p class="font-medium text-green-800">Patient sélectionné</p>
            <p class="text-sm text-green-600">{{ selectedPatient.nom }} {{ selectedPatient.prenom }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <BaseButton variant="primary" @click="$emit('back')">⟵ Retour</BaseButton>
        <BaseButton variant="primary" @click="$emit('next')">Continuer →</BaseButton>
      </div>
    </div>
  </div>
</template>