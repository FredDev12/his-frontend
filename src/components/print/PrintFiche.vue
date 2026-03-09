<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import BaseButton from "../ui/BaseButton.vue"

const props = defineProps({
  patient: {
    type: Object,
    required: true
  },
  receptionData: {
    type: Object,
    default: () => ({})
  },
  showPrintButton: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

// Formater la date
const formatDate = (date) => {
  if (!date) return new Date().toLocaleDateString('fr-FR')
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Numéro de fiche
const ficheNumber = computed(() => {
  return props.patient.numero_patient || `FICHE-${Date.now()}`
})

// Imprimer
const print = () => {
  window.print()
}

// Retour à la liste
const goToList = () => {
  router.push({ name: 'fiches.list' })
}
</script>

<template>
  <div class="print-container">
    <!-- Boutons d'action (non imprimés) -->
    <div v-if="showPrintButton" class="no-print flex justify-end gap-3 mb-6">
      <BaseButton variant="primary" @click="print">
        🖨️ Imprimer
      </BaseButton>
      <BaseButton variant="secondary" @click="goToList">
        ← Retour à la liste
      </BaseButton>
    </div>

    <!-- Fiche à imprimer -->
    <div class="print-content bg-white p-8 rounded-lg shadow-sm border">
      <!-- En-tête -->
      <div class="text-center mb-8 border-b pb-4">
        <h1 class="text-2xl font-bold text-gray-800">HÔPITAL CAC</h1>
        <p class="text-gray-600">FICHE DE RÉCEPTION PATIENT</p>
        <p class="text-sm text-gray-500 mt-1">N° {{ ficheNumber }}</p>
      </div>

      <!-- Informations patient -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">INFORMATIONS PATIENT</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Nom complet</p>
            <p class="font-medium">{{ patient.nom }} {{ patient.prenom }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Sexe</p>
            <p class="font-medium">{{ patient.sexe === 'M' ? 'Masculin' : 'Féminin' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Date de naissance</p>
            <p class="font-medium">{{ patient.date_naissance || 'Non renseignée' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Âge</p>
            <p class="font-medium">{{ patient.age || '-' }} ans</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Téléphone</p>
            <p class="font-medium">{{ patient.telephone || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Adresse</p>
            <p class="font-medium">{{ patient.adresse || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Type de patient -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">TYPE DE PATIENT</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Catégorie</p>
            <p class="font-medium">{{ receptionData.patientType === 'agent' ? 'Agent CAC' : 'Public' }}</p>
          </div>
          <div v-if="receptionData.patientType === 'agent'">
            <p class="text-sm text-gray-600">Relation</p>
            <p class="font-medium">{{ receptionData.relation || 'Agent lui-même' }}</p>
          </div>
        </div>
      </div>

      <!-- Informations agent (si applicable) -->
      <div v-if="receptionData.agent" class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">INFORMATIONS AGENT CAC</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Nom</p>
            <p class="font-medium">{{ receptionData.agent.nom_post }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">CAC ID</p>
            <p class="font-medium">{{ receptionData.agent.cac_id_co }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Fonction</p>
            <p class="font-medium">{{ receptionData.agent.fonction }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Site</p>
            <p class="font-medium">{{ receptionData.agent.site }}</p>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">SERVICES</h2>
        <div class="grid grid-cols-2 gap-2">
          <div v-if="patient.medecine_interne" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Médecine interne
          </div>
          <div v-if="patient.pediatrie" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Pédiatrie
          </div>
          <div v-if="patient.gyneco_obstetrique" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Gynéco-obstétrique
          </div>
          <div v-if="patient.chirurgie" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Chirurgie
          </div>
          <div v-if="!patient.medecine_interne && !patient.pediatrie && !patient.gyneco_obstetrique && !patient.chirurgie">
            <p class="text-gray-500">Aucun service sélectionné</p>
          </div>
        </div>
      </div>

      <!-- Urgence -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">URGENCE</h2>
        <div>
          <span 
            class="px-3 py-1 rounded-full text-sm"
            :class="patient.urgence ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ patient.urgence ? 'URGENCE' : 'Normal' }}
          </span>
        </div>
      </div>

      <!-- Paiement -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">PAIEMENT</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Statut</p>
            <p class="font-medium">
              <span 
                class="px-3 py-1 rounded-full text-sm"
                :class="receptionData.paymentValidated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ receptionData.paymentValidated ? 'PAYÉ' : 'NON PAYÉ' }}
              </span>
            </p>
          </div>
          <div v-if="receptionData.payment">
            <p class="text-sm text-gray-600">Montant</p>
            <p class="font-medium">{{ receptionData.payment.amount || '5000' }} FCFA</p>
          </div>
          <div v-if="receptionData.payment?.facture">
            <p class="text-sm text-gray-600">N° Facture</p>
            <p class="font-medium">{{ receptionData.payment.facture }}</p>
          </div>
          <div v-if="receptionData.payment?.recu">
            <p class="text-sm text-gray-600">N° Reçu</p>
            <p class="font-medium">{{ receptionData.payment.recu }}</p>
          </div>
        </div>
      </div>

      <!-- Date et signature -->
      <div class="mt-12 pt-8 border-t grid grid-cols-2 gap-8">
        <div>
          <p class="text-sm text-gray-600 mb-8">Date d'admission</p>
          <p class="font-medium">{{ formatDate(patient.created_at || new Date()) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-8">Signature du réceptionniste</p>
          <p class="font-medium border-b border-gray-300 pb-1"></p>
        </div>
      </div>

      <!-- Mentions légales -->
      <div class="mt-8 text-center text-xs text-gray-400">
        <p>Document généré automatiquement par HIS - Hôpital CAC</p>
        <p>Fiche valable pour admission et services hospitaliers</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-container {
    padding: 0 !important;
    background: white !important;
  }
  
  .print-content {
    box-shadow: none !important;
    border: none !important;
    padding: 0.5in !important;
  }
  
  .bg-gray-100 {
    background-color: #f3f4f6 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .bg-green-100, .bg-red-100 {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>