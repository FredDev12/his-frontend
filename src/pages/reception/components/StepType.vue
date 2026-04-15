<script setup>
import PatientTypeSelector from "../../../modules/reception/components/PatientTypeSelector.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"

const props = defineProps({
  patientType: String
})

const emit = defineEmits(["update:patientType", "next"])
</script>

<template>
  <div class="space-y-6">
    <PatientTypeSelector 
      :modelValue="patientType" 
      @update:modelValue="$emit('update:patientType', $event)"
    />
    <div class="flex justify-end">
      <BaseButton variant="primary" @click="$emit('next')" size="lg">
        Démarrer l'admission
        <span class="ml-2">→</span>
      </BaseButton>
    </div>
  </div>
</template>