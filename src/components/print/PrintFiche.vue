<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import BaseButton from "../ui/BaseButton.vue"
import html2pdf from 'html2pdf.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
const isGenerating = ref(false)

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

console.log("patient print", props.patient)
console.log("reception data", props.receptionData)

// Numéro de fiche
const ficheNumber = computed(() => {
  return props.patient.identification?.numero_patient || `FICHE-${Date.now()}`
})

const ageDisplay = computed(() => {
  const age = props.patient?.identification?.age
  return age ? `${age} ans` : 'Non défini'
})

// Générer PDF avec html2pdf
const generatePDF = async () => {
  isGenerating.value = true
  
  try {
    const element = document.querySelector('.print-content')
    
    // Capturer l'élément avec html2canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true,
      // Forcer le mode RGB
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.print-content')
        // Forcer les couleurs en RGB
        const style = clonedDoc.createElement('style')
        style.textContent = `
          * { color: rgb(0,0,0) !important; }
          .bg-gray-100 { background-color: rgb(243,244,246) !important; }
          .bg-green-100 { background-color: rgb(220,252,231) !important; }
          .bg-red-100 { background-color: rgb(254,226,226) !important; }
        `
        clonedElement.appendChild(style)
      }
    })
    
    // Créer le PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'cm',
      format: 'a4'
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const width = imgWidth * ratio
    const height = imgHeight * ratio
    
    pdf.addImage(imgData, 'JPEG', (pdfWidth - width) / 2, 0, width, height)
    //pdf.save(`fiche-${ficheNumber.value}.pdf`)
    // Ouvrir dans un nouvel onglet au lieu de télécharger
    const pdfBlob = pdf.output('blob')
    const pdfFile = new File([pdfBlob], `fiche-${ficheNumber.value}.pdf`, { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(pdfFile)

    window.open(pdfUrl, '_blank')

    //const link = document.createElement('a')
    //link.href = pdfUrl
    //link.target = '_blank'
    //link.download = `fiche-${ficheNumber.value}.pdf` // Optionnel : pour le téléchargement
    //document.body.appendChild(link)
    //link.click()
    //document.body.removeChild(link)
    
    // Nettoyer l'URL après l'ouverture (optionnel)
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100)
    
  } catch (error) {
    console.error('Erreur PDF:', error)
    alert('Erreur lors de la génération du PDF')
  } finally {
    isGenerating.value = false
  }
}



// Option d'impression directe (via le navigateur)
const printDirect = () => {
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
      <BaseButton 
        variant="primary" 
        @click="generatePDF" 
        :loading="isGenerating"
      >
        <span v-if="!isGenerating">📄 Télécharger PDF</span>
        <span v-else>Génération en cours...</span>
      </BaseButton>
      
      <BaseButton variant="secondary" @click="printDirect">
        🖨️ Imprimer
      </BaseButton>
      
      <BaseButton variant="secondary" @click="goToList">
        ← Retour à la liste
      </BaseButton>
    </div>

    <!-- Fiche à imprimer / exporter -->
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
            <p class="font-medium">{{ patient.identification?.nom }} {{ patient.identification?.prenom }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Sexe</p>
            <p class="font-medium">{{ patient.identification?.sexe === 'M' ? 'Masculin' : 'Féminin' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Date de naissance</p>
            <p class="font-medium">{{ patient.identification?.date_naissance || 'Non défini' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Âge</p>
            <p class="font-medium">{{ ageDisplay }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Téléphone</p>
            <p class="font-medium">{{ patient.telephone || 'Non défini' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Adresse</p>
            <p class="font-medium">{{ patient.adresse || 'Non défini' }}</p>
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

      <!-- Type de passage et priorité (ajouté) -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">ADMISSION</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Type de passage</p>
            <p class="font-medium">{{ receptionData.typePassage || 'NEW' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Priorité</p>
            <p class="font-medium">{{ receptionData.priorite || 'ROUTINE' }}</p>
          </div>
          <div v-if="receptionData.serviceEntree">
            <p class="text-sm text-gray-600">Service d'entrée</p>
            <p class="font-medium">{{ receptionData.serviceEntree }}</p>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold bg-gray-100 p-2 mb-4">SERVICES</h2>
        <div class="grid grid-cols-2 gap-2">
          <div v-if="patient.service_entree?.medecine_interne" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Médecine interne
          </div>
          <div v-if="patient.service_entree?.pediatrie" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Pédiatrie
          </div>
          <div v-if="patient.service_entree?.gyneco_obstetrique" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Gynéco-obstétrique
          </div>
          <div v-if="patient.service_entree?.chirurgie" class="flex items-center gap-2">
            <span class="text-green-600">✓</span> Chirurgie
          </div>
          <div v-if="!patient.service_entree?.medecine_interne && !patient.service_entree?.pediatrie && !patient.service_entree?.gyneco_obstetrique && !patient.service_entree?.chirurgie">
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
            :class="patient.priorite?.urgence ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ patient.priorite?.urgence ? 'URGENCE' : 'Normal' }}
          </span>
        </div>
      </div>

      <!-- Paiement -->
      <div v-if="receptionData.patientType !== 'agent'" class="mb-6">
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

/* Animation de chargement */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>