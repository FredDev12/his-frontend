<template>
  <div class="consultation-form">
    <form @submit.prevent="submitForm" class="space-y-6">

      <!-- INFORMATIONS GENERALES -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Informations générales</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Patient -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select
              v-model="form.patientId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un patient</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.nom }} {{ patient.prenom }}
              </option>
            </select>
          </div>

          <!-- Médecin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Médecin *</label>
            <select
              v-model="form.medecinId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un médecin</option>
              <option v-for="medecin in medecins" :key="medecin.id" :value="medecin.id">
                Dr. {{ medecin.nom }} {{ medecin.prenom }}
              </option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              v-model="form.dateConsultation"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Heure -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
            <input
              v-model="form.heureConsultation"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type de consultation *</label>
            <select
              v-model="form.type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="GENERALE">Générale</option>
              <option value="SPECIALISEE">Spécialisée</option>
              <option value="URGENCE">Urgence</option>
              <option value="SUIVI">Suivi</option>
            </select>
          </div>

          <!-- Statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="form.statut"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>

        </div>
      </div>

      <!-- MOTIF -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Motif de consultation</h3>
        <textarea
          v-model="form.motif"
          rows="3"
          placeholder="Décrivez le motif de la consultation..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- CONSTANTES -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Constantes</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
            <input
              v-model.number="form.poids"
              type="number"
              step="0.1"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
            <input
              v-model.number="form.taille"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Température (°C)</label>
            <input
              v-model.number="form.temperature"
              type="number"
              step="0.1"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tension</label>
            <input
              v-model="form.tension"
              placeholder="120/80"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        <!-- IMC calculé -->
        <div v-if="form.poids && form.taille" class="mt-4 p-3 bg-gray-50 rounded-md">
          <div class="text-sm text-gray-600">
            IMC calculé: <span class="font-medium">{{ calculateIMC(form.poids, form.taille) }}</span>
            <span class="text-xs text-gray-500 ml-2">
              ({{ getIMCCategory(calculateIMC(form.poids, form.taille)) }})
            </span>
          </div>
        </div>
      </div>

      <!-- DIAGNOSTIC -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Diagnostic</h3>
        <textarea
          v-model="form.diagnostic"
          rows="3"
          placeholder="Diagnostic médical..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- TRAITEMENT -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Traitement</h3>
        <textarea
          v-model="form.traitement"
          rows="3"
          placeholder="Traitement prescrit..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- NOTES -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Notes complémentaires</h3>
        <textarea
          v-model="form.notes"
          rows="4"
          placeholder="Notes supplémentaires..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- ACTIONS -->
      <div class="flex justify-end gap-3 pt-4">
        <BaseButton variant="outline" @click="$emit('cancel')" :disabled="loading">
          Annuler
        </BaseButton>
        <BaseButton variant="primary" type="submit" :loading="loading">
          {{ isEditing ? 'Modifier' : 'Créer' }} la consultation
        </BaseButton>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useConsultations } from '../composables/useConsultations'
import BaseButton from '../../../components/ui/BaseButton.vue'

// Props
const props = defineProps({
  consultation: {
    type: Object,
    default: null
  },
  patients: {
    type: Array,
    default: () => []
  },
  medecins: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// Composables
const { calculateIMC, getIMCCategory } = useConsultations()

// State
const loading = ref(false)
const form = ref({
  patientId: '',
  medecinId: '',
  dateConsultation: '',
  heureConsultation: '',
  motif: '',
  type: 'GENERALE',
  statut: 'EN_ATTENTE',
  diagnostic: '',
  traitement: '',
  notes: '',
  poids: null,
  taille: null,
  temperature: null,
  tension: ''
})

// Computed
const isEditing = computed(() => !!props.consultation)

// Methods
const submitForm = async () => {
  loading.value = true
  try {
    // Validation basique
    if (!form.value.patientId || !form.value.medecinId || !form.value.dateConsultation) {
      throw new Error('Veuillez remplir tous les champs obligatoires')
    }

    // Nettoyer les données
    const cleanForm = { ...form.value }
    Object.keys(cleanForm).forEach(key => {
      if (cleanForm[key] === '' || cleanForm[key] === null) {
        delete cleanForm[key]
      }
    })

    emit('submit', cleanForm)
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
    // TODO: Afficher une notification d'erreur
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => props.consultation, (newConsultation) => {
  if (newConsultation) {
    // Pré-remplir le formulaire pour l'édition
    form.value = {
      patientId: newConsultation.patientId || '',
      medecinId: newConsultation.medecinId || '',
      dateConsultation: newConsultation.dateConsultation ? newConsultation.dateConsultation.split('T')[0] : '',
      heureConsultation: newConsultation.heureConsultation || '',
      motif: newConsultation.motif || '',
      type: newConsultation.type || 'GENERALE',
      statut: newConsultation.statut || 'EN_ATTENTE',
      diagnostic: newConsultation.diagnostic || '',
      traitement: newConsultation.traitement || '',
      notes: newConsultation.notes || '',
      poids: newConsultation.poids || null,
      taille: newConsultation.taille || null,
      temperature: newConsultation.temperature || null,
      tension: newConsultation.tension || ''
    }
  } else {
    // Reset form for creation
    form.value = {
      patientId: '',
      medecinId: '',
      dateConsultation: '',
      heureConsultation: '',
      motif: '',
      type: 'GENERALE',
      statut: 'EN_ATTENTE',
      diagnostic: '',
      traitement: '',
      notes: '',
      poids: null,
      taille: null,
      temperature: null,
      tension: ''
    }
  }
}, { immediate: true })

// Set default date to today for new consultations
onMounted(() => {
  if (!isEditing.value && !form.value.dateConsultation) {
    const today = new Date().toISOString().split('T')[0]
    form.value.dateConsultation = today
  }
})
</script>
