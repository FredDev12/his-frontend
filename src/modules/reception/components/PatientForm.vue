<script setup>
import { ref, watch, computed } from "vue"
import { createPatient, updatePatient } from "../../../api/patients.api"
import { useToastStore } from "../../../stores/toast.store"
import { useReceptionStore } from "../../../stores/reception.store"

import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"
import RadioGroup from "../../../components/ui/RadioGroup.vue"

const toast = useToastStore()
const reception = useReceptionStore()

const props = defineProps({
  agent: Object,
  patient: Object,
  relation: { type: String, default: "SELF" },
  typedChildName: { type: String, default: "" },
  patientType: { type: String, default: "public" } 
})

const saving = ref(false)

// Types de passage et priorités
const typePassageOptions = [
  { value: "NEW", label: "Nouvelle admission" },
  { value: "CONSULTATION", label: "Consultation" },
  { value: "REFERE", label: "Référé" },
  { value: "URGENCE", label: "Urgence" },
  { value: "RENDEZ_VOUS", label: "Rendez-vous" }
]

const prioriteOptions = [
  { value: "ROUTINE", label: "Routine", color: "blue" },
  { value: "URGENT", label: "Urgent", color: "orange" },
  //{ value: "TRES_URGENT", label: "Très urgent", color: "red" },
  //{ value: "VITALE", label: "Vitale", color: "purple" }
]

const serviceOptions = [
  // Médecine
  { value: "medecine_interne", label: "Médecine interne", icon: "🏥", category: "medical" },
  { value: "pediatrie", label: "Pédiatrie", icon: "👶", category: "medical" },
  { value: "cardiologie", label: "Cardiologie", icon: "❤️", category: "medical" },
  
  // Chirurgie
  { value: "chirurgie", label: "Chirurgie", icon: "🔪", category: "surgery" },
  { value: "gyneco_obstetrique", label: "Gynéco-obstétrique", icon: "👩", category: "surgery" },
  
  // Imagerie
  { value: "radiologie", label: "Radiologie", icon: "📡", category: "imaging" },
  { value: "scanner", label: "Scanner", icon: "🖥️", category: "imaging" },
  { value: "imagerie", label: "Imagerie", icon: "📷", category: "imaging" },
  
  // Laboratoire
  { value: "laboratoire", label: "Laboratoire", icon: "🔬", category: "lab" },
  { value: "biochimie", label: "Biochimie", icon: "🧪", category: "lab" },
  { value: "hematologie", label: "Hématologie", icon: "🩸", category: "lab" },
  { value: "parasitologie", label: "Parasitologie", icon: "🦠", category: "lab" },
  { value: "bacteriologie", label: "Bactériologie", icon: "🧫", category: "lab" },
  { value: "serologie", label: "Sérologie", icon: "💉", category: "lab" },
  { value: "immunologie", label: "Immunologie", icon: "🛡️", category: "lab" },
  
  // Consultations
  { value: "cpn_cpon", label: "CPN, CPON", icon: "🤰", category: "consultation" },
  { value: "vaccin", label: "Vaccin", icon: "💊", category: "consultation" }
]

// Champs API Patients
const nom = ref("")
const prenom = ref("")
const sexe = ref("")
const date_naissance = ref("")
const age = ref("")
const telephone = ref("")
const adresse = ref("")
const urgence = ref(false)

const sexeOptions = [
  { value: 'M', label: 'Masculin', icon: '👨', color: 'blue' },
  { value: 'F', label: 'Féminin', icon: '👩', color: 'pink' }
]

// Champs supplémentaires
const typePassage = ref(reception.draft?.typePassage || "NEW")
const priorite = ref(reception.draft?.priorite || "ROUTINE")
const serviceEntree = ref(reception.draft?.serviceEntree || "")

// Services API (bool)
const services = ref({
  medecine_interne: false,
  pediatrie: false,
  gyneco_obstetrique: false,
  chirurgie: false,
  cardiologie: false,
  radiologie: false,
  laboratoire: false
})

const emit = defineEmits(["saved", "print"])

const isEdit = computed(() => !!props.patient?.id)

// Computed pour l'affichage conditionnel
const showPaymentBadge = computed(() => props.patientType === "public")
const requiresPayment = computed(() => props.patientType === "public" && !reception.paymentValidated)

// Helpers
const safe = (v) => {
  const s = (v ?? "").toString().trim()
  return s.toLowerCase() === "null" ? "" : s
}
const normalizeSpaces = (s) => safe(s).replace(/\s+/g, " ").trim()

const splitFullName = (full) => {
  const s = normalizeSpaces(full)
  if (!s) return { nom: "", prenom: "" }
  const parts = s.split(" ")
  if (parts.length === 1) return { nom: s, prenom: "" }
  return { nom: parts.slice(0, -1).join(" "), prenom: parts.slice(-1).join(" ") }
}

const guessSexe = (agentSexe) => {
  const s = normalizeSpaces(agentSexe).toUpperCase()
  if (s === "M" || s === "H" || s.includes("MASC")) return "M"
  if (s === "F" || s.includes("FEM")) return "F"
  return ""
}

const loadFromPatient = (p) => {
  nom.value = safe(p?.nom)
  prenom.value = safe(p?.prenom)
  sexe.value = safe(p?.sexe)
  date_naissance.value = safe(p?.date_naissance)
  age.value = safe(p?.age)
  telephone.value = safe(p?.telephone)
  adresse.value = safe(p?.adresse)
  urgence.value = !!p?.urgence

  // Services
  services.value.medecine_interne = !!p?.medecine_interne
  services.value.pediatrie = !!p?.pediatrie
  services.value.gyneco_obstetrique = !!p?.gyneco_obstetrique
  services.value.chirurgie = !!p?.chirurgie
  services.value.cardiologie = !!p?.cardiologie
  services.value.radiologie = !!p?.radiologie
  services.value.laboratoire = !!p?.laboratoire
}

const loadFromAgent = (a) => {
  if (!a) return
  const rel = props.relation || "SELF"

  if (rel === "SELF") {
    const full = normalizeSpaces(a.nom_post)
    const sp = splitFullName(full)
    nom.value = sp.nom
    prenom.value = safe(a.prenom) || sp.prenom
    telephone.value = normalizeSpaces(a.telephone)
    sexe.value = guessSexe(a.sexe)
  }

  if (rel === "SPOUSE") {
    const spouseFull = normalizeSpaces(a.nom_conjoint)
    const sp = splitFullName(spouseFull)
    nom.value = sp.nom || spouseFull
    prenom.value = sp.prenom
    telephone.value = normalizeSpaces(a.telephone) 
    sexe.value = ""
  }

  if (rel === "PARENT") {
    nom.value = normalizeSpaces(a.parents)
    prenom.value = ""
    telephone.value = ""
    sexe.value = ""
  }

  if (rel === "CHILD") {
    const child = normalizeSpaces(props.typedChildName)
    const sp = splitFullName(child)
    nom.value = sp.nom || child
    prenom.value = sp.prenom
    telephone.value = ""
    sexe.value = ""
  }
}

const validateApiFields = () => {
  if (!normalizeSpaces(nom.value) || !normalizeSpaces(prenom.value)) {
    toast.add("Nom et Prénom sont obligatoires", "error")
    return false
  }
  return true
}

const buildPayload = () => ({
  nom: normalizeSpaces(nom.value),
  prenom: normalizeSpaces(prenom.value),
  sexe: normalizeSpaces(sexe.value),
  date_naissance: normalizeSpaces(date_naissance.value),
  age: normalizeSpaces(age.value),
  telephone: normalizeSpaces(telephone.value),
  adresse: normalizeSpaces(adresse.value),
  urgence: !!urgence.value,
  type_passage: typePassage.value,
  priorite: priorite.value,
  service_entree: serviceEntree.value,

  // Services
  medecine_interne: !!services.value.medecine_interne,
  pediatrie: !!services.value.pediatrie,
  gyneco_obstetrique: !!services.value.gyneco_obstetrique,
  chirurgie: !!services.value.chirurgie,
  cardiologie: !!services.value.cardiologie,
  radiologie: !!services.value.radiologie,
  laboratoire: !!services.value.laboratoire
})

// Mise à jour du store quand les champs changent
watch([typePassage, priorite, serviceEntree], () => {
  if (reception.updateDraft) {
    reception.updateDraft({
      typePassage: typePassage.value,
      priorite: priorite.value,
      serviceEntree: serviceEntree.value
    })
  }
})

watch(
  () => props.patient,
  (p) => {
    if (!p) return
    loadFromPatient(p)
  },
  { immediate: true }
)

watch(
  () => [props.agent, props.relation, props.typedChildName, isEdit.value],
  ([a, _rel, _child, edit]) => {
    if (!a || edit) return
    loadFromAgent(a)
  },
  { immediate: true }
)

const submit = async () => {
  // Paiement obligatoire uniquement pour les patients publics
  if (requiresPayment.value) {
    toast.add("Paiement fiche obligatoire avant admission", "error")
    return
  }

  if (!validateApiFields()) return

  saving.value = true
  try {
    const payload = buildPayload()
    let patientId = null
    let response = null

    if (isEdit.value) {
      await updatePatient(props.patient.id, payload)
      patientId = props.patient.id
      toast.add("Fiche patient mise à jour", "success")
    } else {
      response = await createPatient(payload)
      patientId = response.data.id || response.data.patient?.id
      toast.add("Fiche patient créée", "success")
    }

    const patientData = isEdit.value ? props.patient : response?.data

    emit("saved", { 
      mode: isEdit.value ? "update" : "create", 
      patientId,
      patient: patientData,
      receptionData: {
        patientType: props.patientType,
        agent: props.agent,
        relation: props.relation,
        typePassage: typePassage.value,
        priorite: priorite.value,
        serviceEntree: serviceEntree.value,
        paymentValidated: reception.paymentValidated,
        payment: reception.payment
      }
    })
  } catch (e) {
    console.error("Erreur sauvegarde:", e)
    toast.add("Erreur lors de l'enregistrement", "error")
  } finally {
    saving.value = false
  }
}

console.log("patient type", props.patientType)
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- En-tête -->
    <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">
            {{ isEdit ? "Modifier la fiche patient" : "Créer une fiche patient" }}
          </h2>
          <p v-if="agent" class="text-xs text-gray-600 mt-1">
            Source: Agent CAC • Relation: {{ relation === 'SELF' ? 'Lui-même' : relation }}
          </p>
        </div>
        <div v-if="isEdit" class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          #{{ patient.id }}
        </div>
      </div>
    </div>

    <!-- Badges d'information -->
    <div class="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2">
      <!-- Badge paiement (visible seulement pour les publics) -->
      <BaseBadge 
        v-if="showPaymentBadge"
        :type="reception.paymentValidated ? 'success' : 'danger'"
        size="sm"
      >
        {{ reception.paymentValidated ? "✓ Paiement validé" : "⚠ Paiement obligatoire" }}
      </BaseBadge>

      <!-- Type de passage -->
      <BaseBadge type="warning" size="sm">
        {{ typePassageOptions.find(o => o.value === typePassage)?.label || typePassage }}
      </BaseBadge>

      <!-- Priorité -->
      <BaseBadge 
        :type="priorite === 'ROUTINE' ? 'primary' : priorite === 'URGENT' ? 'warning' : 'danger'"
        size="sm"
      >
        {{ prioriteOptions.find(o => o.value === priorite)?.label || priorite }}
      </BaseBadge>

      <!-- Service d'entrée si sélectionné -->
      <BaseBadge v-if="serviceEntree" type="primary" size="sm">
        {{ serviceOptions.find(o => o.value === serviceEntree)?.label || serviceEntree }}
      </BaseBadge>
    </div>

    <!-- Formulaire -->
    <div class="p-6 space-y-6">
      <!-- Sélecteurs supplémentaires -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Type de passage -->
        <div>
          <label class="text-sm font-medium text-gray-600 mb-1.5 block">
            Type de passage <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="typePassage"
            class="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option v-for="opt in typePassageOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Priorité -->
        <div>
          <label class="text-sm font-medium text-gray-600 mb-1.5 block">
            Priorité <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="priorite"
            class="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option v-for="opt in prioriteOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Service d'entrée -->
         <!--
        <div>
          <label class="text-sm font-medium text-gray-600 mb-1.5 block">
            Service d'entrée
          </label>
          <select 
            v-model="serviceEntree"
            class="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Sélectionner un service</option>
            <option v-for="opt in serviceOptions" :key="opt.value" :value="opt.value">
              {{ opt.icon }} {{ opt.label }}
            </option>
          </select>
        </div>-->
      </div>

      <!-- Identification -->
      <div class="grid gap-4 md:grid-cols-2">
        <BaseInput label="Nom *" v-model="nom" placeholder="Ex: KABAMBA" />
        <BaseInput label="Prénom *" v-model="prenom" placeholder="Ex: Jean" />
        <BaseInput label="Téléphone" v-model="telephone" placeholder="Ex: 243812345678" />
        <RadioGroup 
          label="Genre *" 
          v-model="sexe" 
          :options="sexeOptions"
        />
        <BaseInput label="Date de naissance" v-model="date_naissance" placeholder="YYYY-MM-DD" />
        <BaseInput label="Âge" v-model="age" placeholder="Ex: 35" type="number" />
        <BaseInput label="Adresse" v-model="adresse" placeholder="Adresse complète" class="md:col-span-2" />
      </div>

      <!-- Urgence -->
      <label class="flex items-center gap-2 text-sm cursor-pointer p-3 bg-gray-50 rounded-lg">
        <input type="checkbox" v-model="urgence" class="rounded text-blue-600" />
        <span class="font-medium">Urgence</span>
        <span class="text-xs text-gray-500">(Cocher si le patient est en urgence)</span>
      </label>

      <!-- Services disponibles -->
      <div class="border rounded-lg p-4 bg-gray-50 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">Services disponibles</h3>
          <span class="text-xs text-gray-500">Sélectionnez un ou plusieurs services</span>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label v-for="service in serviceOptions" :key="service.value" 
                 class="flex items-center gap-2 text-sm cursor-pointer p-2 bg-white rounded border hover:bg-blue-50 transition"
                 :class="{ 'border-blue-300 bg-blue-50': services[service.value] }">
            <input 
              type="checkbox" 
              v-model="services[service.value]"
              class="rounded text-blue-600"
            />
            <span>{{ service.icon }} {{ service.label }}</span>
          </label>
        </div>
        
        <!--
        <div class="text-xs text-gray-500 bg-white p-2 rounded">
          ⚠️ Note: L'API backend ne supporte pas encore tous ces champs. Certains peuvent être ignorés.
        </div>-->
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 border-t">
        <div v-if="requiresPayment" class="text-sm text-red-600 flex items-center gap-2">
          <span>⚠️</span>
          Paiement obligatoire avant création
        </div>
        <div v-else-if="showPaymentBadge && reception.paymentValidated" class="text-sm text-green-600 flex items-center gap-2">
          <span>✓</span>
          Paiement validé
        </div>
        <div v-else></div>

        <BaseButton
          :loading="saving"
          :variant="isEdit ? 'primary' : 'success'"
          @click="submit"
          :disabled="requiresPayment"
          class="px-8"
        >
          {{ isEdit ? "Mettre à jour" : "Créer la fiche" }}
        </BaseButton>
      </div>

      <!-- Note d'information -->
       <!--
      <div class="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
        <p class="flex items-center gap-2">
          <span>⚠️</span>
          <span>
            Le lien officiel Patient ↔ Agent CAC n'est pas encore stockable côté API. 
            Le front applique une vérification anti-doublon.
          </span>
        </p>
      </div>-->
    </div>
  </div>
</template>

<style scoped>
input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
}
</style>