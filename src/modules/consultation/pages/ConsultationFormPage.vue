<template>
  <div class="p-6">

    <!-- HEADER -->
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold">
          {{ isEditing ? 'Modifier' : 'Nouvelle' }} Consultation
        </h1>
        <p class="text-sm text-gray-500">
          {{ isEditing ? 'Modifiez les informations de la consultation' : 'Créez une nouvelle consultation médicale' }}
        </p>
      </div>

      <BaseButton variant="outline" @click="goBack">
        Retour à la liste
      </BaseButton>
    </div>

    <!-- FORM -->
    <ConsultationForm
      :consultation="consultation"
      :patients="patients"
      :medecins="medecins"
      @submit="handleSubmit"
      @cancel="goBack"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConsultations } from '../composables/useConsultations'
import ConsultationForm from '../components/ConsultationForm.vue'
import BaseButton from '../../../components/ui/BaseButton.vue'
import { searchPatients } from '../../../api/patients.api'
import { searchAgents } from '../../../api/agents.api'

// Composables
const {
  consultation,
  fetchConsultation,
  createConsultation,
  updateConsultation
} = useConsultations()

// Router
const route = useRoute()
const router = useRouter()

// State
const patients = ref([])
const medecins = ref([])

// Computed
const isEditing = computed(() => !!route.params.id)

// Methods
const goBack = () => {
  router.push({ name: 'ConsultationList' })
}

const handleSubmit = async (formData) => {
  try {
    if (isEditing.value) {
      await updateConsultation(route.params.id, formData)
    } else {
      await createConsultation(formData)
    }

    // Redirect to list with success message
    router.push({
      name: 'ConsultationList',
      query: { success: isEditing.value ? 'updated' : 'created' }
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    // TODO: Afficher une notification d'erreur
  }
}

const loadPatients = async () => {
  try {
    const response = await searchPatients({})
    patients.value = response.data.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des patients:', error)
  }
}

const loadMedecins = async () => {
  try {
    // Pour l'instant, on utilise les agents comme médecins
    // TODO: Créer une API spécifique pour les médecins
    const response = await searchAgents({ fonction: 'MEDECIN' })
    medecins.value = response.data.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des médecins:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadPatients(),
    loadMedecins()
  ])

  if (isEditing.value) {
    await fetchConsultation(route.params.id)
  }
})
</script>

<style scoped>
</style>