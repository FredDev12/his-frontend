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
      proxy: undefined,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      // Forcer le mode RGB
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.print-content')
        // Forcer les couleurs en RGB
        const style = clonedDoc.createElement('style')
        style.textContent = `
          * { 
            color: rgb(0,0,0) !important; 
            border-color: rgb(209,213,219) !important;
            background-color: transparent !important;
          }
          .bg-gray-100 { background-color: rgb(243,244,246) !important; }
          .bg-blue-50 { background-color: rgb(239,246,255) !important; }
          .bg-blue-100 { background-color: rgb(219,234,254) !important; }
          .bg-green-50 { background-color: rgb(240,253,244) !important; }
          .bg-green-100 { background-color: rgb(220,252,231) !important; }
          .bg-red-50 { background-color: rgb(254,242,242) !important; }
          .bg-red-100 { background-color: rgb(254,226,226) !important; }
          .border-blue-200 { border-color: rgb(191,219,254) !important; }
          .border-red-200 { border-color: rgb(254,202,202) !important; }
          .border { border: 1px solid rgb(209,213,219) !important; }
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
    const pdfUrl = URL.createObjectURL(pdfBlob)

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

const serviceLabels = {
  chirurgie: 'CHIRURGIE',
  medecine_interne: 'MÉDECINE INTERNE',
  gyneco_obstetrique: 'GYNÉCO-OBSTÉTRIQUE',
  pediatrie: 'PÉDIATRIE',
  scanner: 'SCANNER',
  imagerie: 'IMAGERIE',
  radiologie: 'RADIOLOGIE',
  laboratoire: 'LABORATOIRE',
  biochimie: 'BIOCHIMIE',
  hematologie: 'HÉMATOLOGIE',
  parasitologie: 'PARASITOLOGIE',
  bacteriologie: 'BACTÉRIOLOGIE',
  serologie: 'SÉROLOGIE',
  immunologie: 'IMMUNOLOGIE',
  cpn: 'CPN,CPON',
  vaccin: 'VACCIN'
}

const hasSelectedServices = computed(() => {
  return Object.keys(serviceLabels).some(key => props.patient.service_entree?.[key])
})

const typeMapping = {
  nouvelle_consultation: { 
    label: 'Nouvelle consultation', 
    icon: '✓',
    class: 'bg-blue-50 border-blue-200'
  },
  refere: { 
    label: 'Référé', 
    icon: '✓',
    class: 'bg-blue-50 border-blue-200'
  },
  controle: { 
    label: 'Contrôle', 
    icon: '✓',
    class: 'bg-blue-50 border-blue-200'
  },
  urgence: { 
    label: 'URGENCE', 
    icon: '⚠',
    class: 'bg-red-50 border-red-200 text-red-700'
  }
}

const selectedType = computed(() => {
  if (!props.patient.type_passage) return null
  
  for (const [key, value] of Object.entries(props.patient.type_passage)) {
    if (value === true) {
      return typeMapping[key] ? { ...typeMapping[key], key } : null
    }
  }
  return null
})



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

    <!-- Fiche à imprimer / exporter - Disposition conforme à l'image -->
    <div class="print-content bg-white p-6 rounded-lg shadow-sm border max-w-4xl mx-auto font-sans">
      <!-- En-tête -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold text-gray-800">HÔPITAL CAC</h1>
        <p class="text-sm text-gray-600">FICHE DE RÉCEPTION PATIENT</p>
      </div>

      <!-- A. Identification du patient -->
      <div class="mb-4">
        <h2 class="font-bold bg-gray-100 p-1 px-2 mb-2 text-sm">A. Identification du patient</h2>
        <table class="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td class="border p-1 w-1/3 font-medium">N° Patient</td>
              <td class="border p-1">{{ ficheNumber }}</td>
              <td class="border p-1 w-1/3 font-medium">Postnom</td>
              <td class="border p-1">{{ patient.identification?.postnom || '_____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Nom</td>
              <td class="border p-1">{{ patient.identification?.nom || '_____' }}</td>
              <td class="border p-1 font-medium">Prénom</td>
              <td class="border p-1">{{ patient.identification?.prenom || '_____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Sexe</td>
              <td class="border p-1">{{ patient.identification?.sexe ? `(${patient.identification.sexe})` : '' }}</td>
              <td class="border p-1 font-medium">Date de naissance</td>
              <td class="border p-1">{{ patient.identification?.date_naissance || '___ / ___ / ____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Âge</td>
              <td class="border p-1">{{ ageDisplay || '_____' }}</td>
              <td class="border p-1 font-medium">Téléphone</td>
              <td class="border p-1">{{ patient.identification?.telephone || '_____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Adresse</td>
              <td class="border p-1" colspan="3">{{ patient.identification?.adresse || '_____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Personne à contacter</td>
              <td class="border p-1">{{ patient.identification?.personne_contacter|| '_____' }}</td>
              <td class="border p-1 font-medium">Téléphone urgence</td>
              <td class="border p-1">{{ patient.identification?.telephone_urgence|| '_____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">État civil</td>
              <td class="border p-1" colspan="3">{{ patient.identification?.etat_civil || '_____' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

     <!-- B. Type de passage -->
      <div class="mb-4">
        <h2 class="font-bold bg-gray-100 p-1 px-2 mb-2 text-sm">B. Type de passage</h2>
        <div class="text-sm mb-2">
          <template v-if="selectedType">
            <div 
              class="inline-block px-3 py-1 rounded border"
              :class="selectedType.class"
            >
              {{ selectedType.icon }} {{ selectedType.label }}
            </div>
          </template>
          <div v-else class="text-gray-500 italic">
            Aucun type de passage sélectionné
          </div>
        </div>

        <!-- Service d'entrée -->
        <div class="mb-2">
          <p class="font-medium text-sm mb-1">Service d'entrée :</p>
          <div class="grid grid-cols-2 gap-1 text-sm">
            <!-- Liste des services avec leur libellé -->
            <template v-for="(service, key) in serviceLabels" :key="key">
              <div class="inline-block px-3 py-1 rounded border bg-blue-50 border-blue-200" v-if="patient.service_entree?.[key]">
                ✓ {{ service }}
              </div>
            </template>
            
            <!-- Message si aucun service sélectionné -->
            <div v-if="!hasSelectedServices" class="col-span-3 text-gray-500 italic">
              Aucun service sélectionné
            </div>
          </div>
        </div>

        <!-- Priorité -->
        <div class="mb-2">
          <div class="font-medium text-sm mb-1">Priorité :</div>
          <div class="inline-block px-3 py-1 rounded border bg-blue-50 border-blue-200" >{{ patient.priorite?.routine ? '✓ Routine' : '✓ Urgent' }} </div>
        </div>
      </div>

      <!-- C. Paiement fiche obligatoire -->
      <div class="mb-4">
        <h2 class="font-bold bg-gray-100 p-1 px-2 mb-2 text-sm">C. Paiement fiche obligatoire</h2>
        <table class="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td class="border p-1 w-1/4 font-medium">Élément</td>
              <td class="border p-1 w-3/4 font-medium" colspan="3">Détail</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Montant fiche</td>
              <td class="border p-1" colspan="3">{{ receptionData.payment?.requiredAmount || '_____' }} FCFA</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Facture N°</td>
              <td class="border p-1" colspan="3">{{ receptionData.payment?.facture || '_____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Reçu N°</td>
              <td class="border p-1" colspan="3">{{ receptionData.payment?.recu || '_____' }}</td>
            </tr>
            <tr>
              <td class="border p-1 font-medium">Payé</td>
              <td class="border p-1">{{ receptionData.payment?.paid === true ? 'Oui' : 'Non' }}</td>
              <td class="border p-1 w-1/4 font-medium">Date paiement</td>
              <td class="border p-1">{{ formatDate(receptionData.payment?.paidAt) || '___ / ___ / ____' }}</td>
            </tr>
          </tbody>
        </table>
        
      </div>

      <!-- Informations agent CAC (si applicable) -->
      <div v-if="receptionData.agent" class="mb-4">
        <h2 class="font-bold bg-blue-100 p-1 px-2 mb-2 text-sm">Informations Agent CAC</h2>
        <div class="grid grid-cols-2 gap-2 text-sm border p-2">
          <div><span class="font-medium">Nom agent:</span> {{ receptionData.agent.nom_post }}</div>
          <div><span class="font-medium">CAC ID:</span> {{ receptionData.agent.cac_id_co }}</div>
          <div><span class="font-medium">Fonction:</span> {{ receptionData.agent.fonction }}</div>
          <div><span class="font-medium">Site:</span> {{ receptionData.agent.site }}</div>
          <div><span class="font-medium">Relation:</span> {{ receptionData.relation || 'Agent lui-même' }}</div>
        </div>
      </div>

      <!-- Date et signature -->
      <div class="mt-8 pt-4 border-t grid grid-cols-2 gap-8 text-sm">
        <div>
          <p class="text-gray-600 mb-1">Date d'admission</p>
          <p class="font-medium border-b pb-1">{{ formatDate(patient.created_at || new Date()) }}</p>
        </div>
        <div>
          <p class="text-gray-600 mb-1">Signature du réceptionniste</p>
          <p class="border-b pb-1"></p>
        </div>
      </div>

      <!-- Mentions légales -->
      <div class="mt-4 text-center text-xs text-gray-400">
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