<template>
  <div class="p-6 space-y-4">

    <!-- HEADER -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Consultation #{{ consultation?.id }}</h1>
        <p class="text-sm text-gray-500">
          {{ consultation?.patient?.nom }} {{ consultation?.patient?.prenom }}
        </p>
      </div>

      <div class="flex gap-2">
        <BaseButton variant="outline" @click="goBack">
          Retour
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="editConsultation"
          v-if="consultation?.statut !== 'TERMINEE'"
        >
          Modifier
        </BaseButton>
      </div>
    </div>

    <!-- STATUS BADGE -->
    <div class="flex justify-start">
      <BaseBadge :type="getStatusBadgeType(consultation?.statut)">
        {{ getStatusLabel(consultation?.statut) }}
      </BaseBadge>
    </div>

    <!-- CONTENT -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- MAIN INFO -->
      <div class="lg:col-span-2 space-y-4">

        <!-- INFORMATIONS GENERALES -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Informations générales</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">Date</label>
              <p class="font-medium">{{ formatDate(consultation?.dateConsultation) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Heure</label>
              <p class="font-medium">{{ consultation?.heureConsultation }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Type</label>
              <p class="font-medium">{{ getTypeLabel(consultation?.type) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Médecin</label>
              <p class="font-medium">
                {{ consultation?.medecin ? `Dr. ${consultation.medecin.nom} ${consultation.medecin.prenom}` : 'Non assigné' }}
              </p>
            </div>
          </div>
        </div>

        <!-- MOTIF -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Motif de consultation</h3>
          <p class="text-gray-700">{{ consultation?.motif || 'Non spécifié' }}</p>
        </div>

        <!-- CONSTANTES -->
        <div class="card" v-if="consultation?.poids || consultation?.taille || consultation?.temperature || consultation?.tension">
          <h3 class="text-lg font-semibold mb-4">Constantes</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-if="consultation?.poids">
              <label class="text-sm text-gray-600">Poids</label>
              <p class="font-medium">{{ consultation.poids }} kg</p>
            </div>
            <div v-if="consultation?.taille">
              <label class="text-sm text-gray-600">Taille</label>
              <p class="font-medium">{{ consultation.taille }} cm</p>
            </div>
            <div v-if="consultation?.temperature">
              <label class="text-sm text-gray-600">Température</label>
              <p class="font-medium">{{ consultation.temperature }}°C</p>
            </div>
            <div v-if="consultation?.tension">
              <label class="text-sm text-gray-600">Tension</label>
              <p class="font-medium">{{ consultation.tension }}</p>
            </div>
            <div v-if="consultation?.poids && consultation?.taille" class="md:col-span-2">
              <label class="text-sm text-gray-600">IMC</label>
              <p class="font-medium">
                {{ calculateIMC(consultation.poids, consultation.taille) }}
                <span class="text-sm text-gray-500">
                  ({{ getIMCCategory(calculateIMC(consultation.poids, consultation.taille)) }})
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- DIAGNOSTIC -->
        <div class="card" v-if="consultation?.diagnostic">
          <h3 class="text-lg font-semibold mb-4">Diagnostic</h3>
          <p class="text-gray-700">{{ consultation.diagnostic }}</p>
        </div>

        <!-- TRAITEMENT -->
        <div class="card" v-if="consultation?.traitement">
          <h3 class="text-lg font-semibold mb-4">Traitement</h3>
          <p class="text-gray-700">{{ consultation.traitement }}</p>
        </div>

        <!-- PRESCRIPTIONS -->
        <div class="card" v-if="consultation?.prescriptions?.length">
          <h3 class="text-lg font-semibold mb-4">Prescriptions</h3>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="prescription in consultation.prescriptions" :key="prescription.id" class="text-gray-700">
              {{ prescription.medicament }} - {{ prescription.dosage }}
            </li>
          </ul>
        </div>

        <!-- EXAMENS -->
        <div class="card" v-if="consultation?.examens?.length">
          <h3 class="text-lg font-semibold mb-4">Examens demandés</h3>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="examen in consultation.examens" :key="examen.id" class="text-gray-700">
              {{ examen.nom }}
            </li>
          </ul>
        </div>

        <!-- NOTES -->
        <div class="card" v-if="consultation?.notes">
          <h3 class="text-lg font-semibold mb-4">Notes</h3>
          <p class="text-gray-700 whitespace-pre-line">{{ consultation.notes }}</p>
        </div>

      </div>

      <!-- SIDEBAR -->
      <div class="space-y-4">

        <!-- PATIENT INFO -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Patient</h3>
          <div class="space-y-2">
            <div>
              <label class="text-sm text-gray-600">Nom complet</label>
              <p class="font-medium">{{ consultation?.patient?.nom }} {{ consultation?.patient?.prenom }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Date de naissance</label>
              <p class="font-medium">{{ formatDate(consultation?.patient?.dateNaissance) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Téléphone</label>
              <p class="font-medium">{{ consultation?.patient?.telephone }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Adresse</label>
              <p class="font-medium">{{ consultation?.patient?.adresse }}</p>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Actions</h3>
          <div class="space-y-2">
            <BaseButton
              variant="outline"
              class="w-full"
              @click="printConsultation"
            >
              Imprimer
            </BaseButton>
            <BaseButton
              variant="danger"
              class="w-full"
              @click="deleteConsultations"
              v-if="canDelete"
            >
              Supprimer
            </BaseButton>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConsultations } from '../composables/useConsultations'
import BaseButton from '../../../components/ui/BaseButton.vue'
import BaseBadge from '../../../components/ui/BaseBadge.vue'

// Composables
const {
  consultation,
  isLoading,
  fetchConsultation,
  deleteConsultation,
  getStatusBadgeType,
  getStatusLabel,
  getTypeLabel,
  calculateIMC,
  getIMCCategory
} = useConsultations()

// Router
const route = useRoute()
const router = useRouter()

// Computed
const canDelete = computed(() => consultation.value?.statut !== 'TERMINEE')

// Methods
const goBack = () => {
  router.push({ name: 'ConsultationList' })
}

const editConsultation = () => {
  router.push({
    name: 'ConsultationEdit',
    params: { id: route.params.id }
  })
}

const printConsultation = () => {
  // TODO: Implement print functionality
  window.print()
}

const deleteConsultations = async () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
    try {
      await deleteConsultation(route.params.id)
      router.push({ name: 'ConsultationList' })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(async () => {
  await fetchConsultation(route.params.id)
})
</script>
