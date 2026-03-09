<script setup>
import PatientForm from "../../../modules/reception/components/PatientForm.vue"
import { useRouter } from "vue-router"

const props = defineProps({
  patientType: String,
  selectedAgent: Object,
  selectedPatient: Object,
  relation: String,
  typedChildName: String
})
const router = useRouter()
const emit = defineEmits(["saved"])

const handleSaved = (event) => {
  emit("saved")
  
  // Rediriger vers la page d'impression
  if (event.patientId) {
    const receptionData = encodeURIComponent(JSON.stringify(event.receptionData || {}))
    router.push({
      name: 'fiches.print',
      params: { id: event.patientId },
      query: { data: receptionData }
    })
  }
}

console.log("form patient type", props.patientType)
</script>

<template>
  <div class="space-y-6">
    <PatientForm
      v-if="patientType === 'agent'"
      :agent="selectedAgent"
      :patient="selectedPatient"
      :relation="relation"
      :typedChildName="typedChildName"
      :patientType="patientType"
      @saved="handleSaved"
    />
    <PatientForm v-else :patient="selectedPatient" @saved="handleSaved" />
  </div>
</template>