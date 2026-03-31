<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getPatient } from "../../api/patients.api"
import { useToastStore } from "../../stores/toast.store"
import PrintFiche from "../../components/print/PrintFiche.vue"
import BaseButton from "../../components/ui/BaseButton.vue"

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const patient = ref(null)
const receptionData = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const patientId = route.params.id
    const res = await getPatient(patientId)
    patient.value = res.data.data
    
    // Récupérer les données de réception depuis la query
    if (route.query.data) {
      try {
        receptionData.value = JSON.parse(decodeURIComponent(route.query.data))
      } catch (e) {
        console.error("Erreur parsing données réception:", e)
      }
    }
  } catch (error) {
    toast.add("Erreur lors du chargement de la fiche", "error")
    router.push({ name: 'fiches.list' })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>

  <PrintFiche 
    v-else
    :patient="patient"
    :reception-data="receptionData"
    :show-print-button="true"
  />
</template>