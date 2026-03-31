<script setup>
import BaseBadge from "../../../components/ui/BaseBadge.vue"

const props = defineProps({
  step: Number,
  totalSteps: Number,
  stepTitle: String,
  stepDescription: String,
  patientType: String,
  requiresPayment: Boolean,
  paymentOk: Boolean,
  receptionDraft: Object
})

const emit = defineEmits(["update:step"])

const goToStep = (stepNumber) => {
  if (stepNumber < props.step) {
    emit("update:step", stepNumber)
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-500">Étape {{ step }}/{{ totalSteps }}</span>
        <span class="text-lg font-semibold text-gray-800">{{ stepTitle }}</span>
      </div>
    </div>

    <!-- Stepper progress -->
    <div class="relative">
      <div class="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
      <div 
        class="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-300"
        :style="{ width: ((step - 1) / (totalSteps - 1)) * 100 + '%' }"
      ></div>
      
      <div class="relative flex justify-between">
        <div 
          v-for="i in totalSteps" 
          :key="i"
          class="flex flex-col items-center"
          :class="{ 'cursor-pointer': i < step }"
          @click="goToStep(i)"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all mb-2"
            :class="[
              i < step ? 'bg-blue-600 text-white' : 
              i === step ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 
              'bg-gray-100 text-gray-400'
            ]"
          >
            <span v-if="i < step">✓</span>
            <span v-else>{{ i }}</span>
          </div>
          <span class="text-xs font-medium" :class="i <= step ? 'text-gray-700' : 'text-gray-400'">
            {{ ['Type', 'Recherche', patientType === 'agent' ? 'Famille' : 'Paiement', 'Fiche'][i-1] }}
          </span>
        </div>
      </div>
    </div>

    <!-- Description de l'étape -->
    <p class="text-sm text-gray-600 mt-6 bg-gray-50 p-3 rounded-lg">
      {{ stepDescription }}
    </p>

    <!-- Badges d'information -->
    <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
      <BaseBadge type="primary" size="sm">Step {{ step }}/{{ totalSteps }}</BaseBadge>

      <BaseBadge
        v-if="requiresPayment"
        :type="paymentOk ? 'success' : 'danger'"
        size="sm"
      >
        {{ paymentOk ? "Paiement validé" : "Paiement obligatoire" }}
      </BaseBadge>

      <BaseBadge type="warning" size="sm">
        {{ receptionDraft?.typePassage || "Nouvelle admission" }}
      </BaseBadge>

      <BaseBadge type="primary" size="sm">
        {{ receptionDraft?.priorite || "Routine" }}
      </BaseBadge>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover .w-10 {
  transform: scale(1.05);
}
</style>