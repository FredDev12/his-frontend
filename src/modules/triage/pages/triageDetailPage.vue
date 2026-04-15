<template>
  <div class="p-6 max-w-5xl mx-auto">

    <BaseButton
      variant="outline"
      @click="$router.push('/triage')"
    >
      ← Retour à la liste des triages
    </BaseButton>

    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Triage - Détails de la fiche</h1>

      <div class="text-sm text-gray-500">
        N° Fiche: <span class="font-semibold"> {{ form.numero_fiche || patient.numero_patient }}</span>
      </div>
    </div>

    <!-- PATIENT INFO -->
    <div class="bg-white shadow rounded p-4 mb-4">
      <h2 class="font-bold mb-3">Informations patient</h2>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><b>Nom : </b> {{ patient.nom }}</div>
        <div><b>Prénom : </b> {{ patient.prenom }}</div>
        <div><b>Age : </b> {{ patient.age }}</div>
        <div><b>Sexe : </b> {{ patient.sexe }}</div>
        <div><b>Téléphone : </b> {{ patient.telephone }} </div>
        <div><b> Téléphone d'urgence : </b> {{ patient.telephone_urgence }}</div>
       
      </div>
       <div class="py-2"><b>Adresse : </b> {{ patient.adresse }}</div>
    </div>

    <!-- CONSTANTES VITALES -->
    <div class="bg-white shadow rounded p-4 mb-4">
      <h2 class="font-bold mb-3">Constantes vitales</h2>

      <div class="grid grid-cols-3 gap-4">
        <BaseInput v-model="form.temperature" type="number" placeholder="Température (°C)" class="input" />
        <BaseInput v-model="form.tension" type="text" placeholder="Tension artérielle" class="input" />
        <BaseInput v-model="form.pouls" type="number" placeholder="Pouls" class="input" />
        <BaseInput v-model="form.saturation" type="number" placeholder="SpO2 %" class="input" />
        <BaseInput v-model="form.respiration" type="number" placeholder="Respiration/min" class="input" />
      </div>
    </div>

    <!-- SYMPTOMES -->
    <div class="bg-white shadow rounded p-4 mb-4">
      <h2 class="font-bold mb-3">Symptômes</h2>

      <BaseInput
        type="textarea"
        v-model="form.symptomes"
        rows="4"
        placeholder="Décrire les symptômes du patient..."
      />
    </div>

    <!-- URGENCE -->
    <div class="bg-white shadow rounded p-4 mb-4">
      <h2 class="font-bold mb-3">Niveau d'urgence</h2>

      <RadioGroup 
      v-model="form.niveau_urgence" 
      :options="[
        { label: 'Faible', value: 'faible', color: 'green' },
        { label: 'Modéré', value: 'modere', color: 'yellow' },
        { label: 'Urgent', value: 'urgent', color: 'orange' },
        { label: 'Critique', value: 'critique', color: 'red' },
      ]" />
        
    </div>

    <!-- OBSERVATION -->
    <div class="bg-white shadow rounded p-4 mb-4">
      <h2 class="font-bold mb-3">Observation infirmier</h2>

      <BaseInput
        type="textarea"
        v-model="form.observation"
        rows="3"
        placeholder="Notes du personnel soignant..."
      />
    </div>


    <!-- ACTIONS -->
    <div class="flex justify-end gap-3">
      <BaseButton @click="resetForm" variant="secondary">
        Réinitialiser
      </BaseButton>

      <BaseButton @click="submitTriage" variant="primary">
        Enregistrer le triage
      </BaseButton>
      <BaseButton @click="imprimerTriagePDF" variant="secondary">
        Imprimer PDF
      </BaseButton>
    </div>

  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import RadioGroup from "../../../components/ui/RadioGroup.vue"
import { usePatientsStore } from "../../reception/components/patients/stores/patients.store"
import { useReceptionStore } from "../../reception/stores/reception.store"
import { useTriageStore } from "../stores/triage.store"


import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { useToastStore } from "../../../stores/toast.store"

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const reception = useReceptionStore()
const patients = usePatientsStore()
const triage = useTriageStore()

/**
 * PATIENT
 */
const patient = reactive({
  numero_patient: "",
  nom: "",
  prenom: "",
  age: "",
  sexe: "",
  telephone: "",
  telephone_urgence: "",
  adresse: ""
})

const patientId = route.params.id

const fetchPatientReception = async () => {
  if (!patientId) return

  try {
    const res = await reception.getPatientReception(patientId)
    Object.assign(patient, res.data?.identification_patient || {})
    console.log(res?.data);
    
  } catch (err) {
    console.error("Erreur chargement patient :", err)
  }
}

/**
 * FORM TRIAGE
 */
const form = reactive({
  numero_fiche: route.params.numero_fiche || "",

  temperature: null,
  tension: "",
  pouls: null,
  saturation: null,
  respiration: null,

  symptomes: "",
  niveau_urgence: "modere",
  observation: "",

  montant_fiche: 0,
  mode_paiement: "CASH",
  facture_numero: "",
  recu_numero: "",
  paiement_effectue: false
})

onMounted(() => {
  fetchPatientReception()
})

/**
 * SUBMIT
 */
const submitTriage = async () => {
  const payload = {
    ...form,
    patient,
    created_at: new Date().toISOString()
  }

  toast.add("Triage enregistré avec succès", "success", "top-left", 3000)
  console.log("save triage :",payload);
  
  //router.push("/triage")
}

/**
 * RESET PROPRE
 */
const resetForm = () => {
  form.temperature = null
  form.tension = ""
  form.pouls = null
  form.saturation = null
  form.respiration = null
  form.symptomes = ""
  form.niveau_urgence = "modere"
  form.observation = ""
  form.montant_fiche = 0
  form.mode_paiement = "CASH"
  form.facture_numero = ""
  form.recu_numero = ""
  form.paiement_effectue = false
}

/**
 * PDF PROFESSIONNEL
 */
const imprimerTriagePDF = () => {
  const doc = new jsPDF()

  // HEADER
  doc.setFontSize(14)
  doc.text("HOPITAL - FICHE DE TRIAGE", 14, 10)

  doc.setFontSize(10)
  doc.text(`N° Fiche: ${form.numero_fiche}`, 14, 18)
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 24)

  // PATIENT
  autoTable(doc, {
    startY: 30,
    head: [["Champ", "Valeur"]],
    body: [
      ["Nom", patient.nom || "-"],
      ["Prénom", patient.prenom || "-"],
      ["Age", patient.age || "-"],
      ["Sexe", patient.sexe || "-"],
      ["Téléphone", `${patient.telephone} / ${patient.telephone_urgence}` || "-"],
      ["Adresse", patient.adresse || "-"],
    ],
  })

  // CONSTANTES
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Constante", "Valeur"]],
    body: [
      ["Température", form.temperature ?? "-"],
      ["Tension", form.tension || "-"],
      ["Pouls", form.pouls ?? "-"],
      ["Saturation", form.saturation ?? "-"],
      ["Respiration", form.respiration ?? "-"],
    ],
  })

  // CLINIQUE
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Section", "Détails"]],
    body: [
      ["Symptômes", form.symptomes || "-"],
      ["Urgence", form.niveau_urgence],
      ["Observation", form.observation || "-"],
    ],
  })

  

  // FOOTER
  doc.text(
    "Signature infirmier: __________________________",
    14,
    doc.lastAutoTable.finalY + 20
  )

  doc.save(`triage_${form.numero_fiche}.pdf`)
}
</script>