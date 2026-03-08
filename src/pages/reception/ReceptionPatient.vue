<script setup>
import { ref, watch, computed, onMounted } from "vue"
import { useToastStore } from "../../stores/toast.store"
import { useReceptionStore } from "../../stores/reception.store"

import PatientTypeSelector from "../../modules/reception/components/PatientTypeSelector.vue"
import AgentSearch from "../../modules/reception/components/AgentSearch.vue"
import PatientSearch from "../../modules/reception/components/PatientSearch.vue"
import PatientForm from "../../modules/reception/components/PatientForm.vue"
import FichePayment from "../../modules/reception/components/FichePayment.vue"
import AgentResultCard from "../../modules/reception/components/AgentResultCard.vue"

import BaseButton from "../../components/ui/BaseButton.vue"
import BaseBadge from "../../components/ui/BaseBadge.vue"

import { smartFindExistingPatient } from "../../modules/reception/services/reception.service"
import { getPatient } from "../../api/patients.api"

const toast = useToastStore()
const reception = useReceptionStore()

/**
 * STEP WIZARD (dynamique)
 * PUBLIC:
 * 1 type -> 2 search patient -> 3 paiement -> 4 form
 *
 * AGENT:
 * 1 type -> 2 search agent -> 3 famille + anti-doublon -> 4 form (pas de paiement)
 */
const step = ref(1)
const patientType = ref("public")

const selectedAgent = ref(null)
const selectedPatient = ref(null)

const relation = ref("SELF") // SELF | SPOUSE | CHILD | PARENT
const typedChildName = ref("")

const existingMatches = ref([])
const checkingExisting = ref(false)
const openingPatient = ref(false)

const paymentOk = computed(() => reception.paymentValidated)
const patientAlreadyPaid = computed(() => {
  const p = selectedPatient.value
  if (!p) return false

  // cas 1 : API list/search -> paiement_effectue
  if (p.paiement_effectue === true) return true

  // cas 2 : API détail -> paiement_fiche objet (selon ton backend)
  // adapte les champs si besoin
  if (p.paiement_fiche?.status === "PAID") return true
  if (p.paiement_fiche?.paid === true) return true
  if (p.paiement_fiche?.date_paiement) return true

  return false
})

const requiresPayment = computed(() => patientType.value === "public")

const paymentRequiredNow = computed(() => requiresPayment.value && !patientAlreadyPaid.value)

// accès formulaire :
const canAccessForm = computed(() => {
  if (patientType.value === "agent") return true
  // public => soit déjà payé (fiche existante) soit paiement validé (nouvelle fiche)
  return patientAlreadyPaid.value || paymentOk.value
})

const totalSteps = computed(() => 4)

const stepTitle = computed(() => {
  if (patientType.value === "agent") {
    const map = {
      1: "Étape 1 — Choisir le type de patient",
      2: "Étape 2 — Rechercher et sélectionner l’agent CAC",
      3: "Étape 3 — Ayant-droit / Famille + vérification doublons",
      4: "Étape 4 — Créer / mettre à jour la fiche patient"
    }
    return map[step.value] || "Admission"
  }

  // public
  const map = {
    1: "Étape 1 — Choisir le type de patient",
    2: "Étape 2 — Rechercher le patient (ou créer si nouveau)",
    3: "Étape 3 — Paiement fiche réception (obligatoire)",
    4: "Étape 4 — Créer / mettre à jour la fiche patient"
  }
  return map[step.value] || "Admission"
})


const resetFlow = () => {
  step.value = 1
  patientType.value = "public"

  selectedAgent.value = null
  selectedPatient.value = null

  relation.value = "SELF"
  typedChildName.value = ""

  existingMatches.value = []
  checkingExisting.value = false
  openingPatient.value = false

  // reset paiement (store) si tu as une action
  if (reception.resetPayment) reception.resetPayment()

  // reset draft si tu veux repartir propre
  if (reception.resetDraft) reception.resetDraft()

  toast.add("Admission terminée. Prêt pour une nouvelle fiche ✅", "success")
}

const goNext = () => {
  if (step.value === 1) {
    step.value = 2
    return
  }

  if (step.value === 2) {
    if (patientType.value === "agent") {
      if (!selectedAgent.value) return toast.add("Sélectionne un agent CAC", "info")
      step.value = 3
      return
    } else {
      if (selectedPatient.value && patientAlreadyPaid.value){
        // si patient déjà sélectionné, on skip paiement et on va direct form
        step.value = 4
        return
      }

      step.value = 3
      return
    }
  }

  // agent: 3 -> 4
  if (patientType.value === "agent" && step.value === 3) {
    step.value = 4
    return
  }

  // public: 3 paiement -> 4 form
  if (patientType.value === "public" && step.value === 3) {
    if (!canAccessForm.value) return toast.add("Paiement obligatoire avant de continuer", "warning")
    step.value = 4
    return
  }
}

const goBack = () => {
  if (step.value === 1) return
  step.value -= 1
}

onMounted(() => {
  if (reception.loadDraft) reception.loadDraft()
})

/** Auto-step au clic résultat agent */
const handleAgent = (agent) => {
  selectedAgent.value = agent
  selectedPatient.value = null
  existingMatches.value = []
  toast.add("Agent sélectionné", "success")

  // va direct étape famille
  step.value = 3
}

/** Ouvrir une fiche patient + auto-step selon contexte */
const handlePatient = async (patient) => {
  openingPatient.value = true
  try {
    const res = await getPatient(patient.id)
    selectedPatient.value = res.data.data
    toast.add("Fiche patient ouverte", "success")

    // public: une fois patient choisi -> paiement
    if (patientType.value === "public") {
        step.value = patientAlreadyPaid.value ? 4 : 3
    }

    // agent: si on clique un match existant -> form direct
    if (patientType.value === "agent") {
        step.value = 4
    }
  } catch (e) {
    toast.add("Impossible d’ouvrir la fiche patient", "error")
  } finally {
    openingPatient.value = false
  }
}

const chooseRelation = async (rel) => {
  relation.value = rel
  existingMatches.value = []
  selectedPatient.value = null

  if (!selectedAgent.value) return

  if (rel === "CHILD" && !typedChildName.value.trim()) {
    toast.add("Saisis le nom de l’enfant puis clique sur Vérifier", "info")
    return
  }

  await checkExisting()
}

const checkExisting = async () => {
  if (!selectedAgent.value) return

  checkingExisting.value = true
  try {
    const res = await smartFindExistingPatient({
      relation: relation.value,
      agent: selectedAgent.value,
      typedName: typedChildName.value
    })

    existingMatches.value = res.matches || []

    if (existingMatches.value.length > 0) {
      toast.add("Fiches existantes possibles trouvées", "info")
    } else {
      toast.add("Aucune fiche existante trouvée, tu peux créer", "success")
    }
  } catch (e) {
    toast.add("Erreur lors de la vérification des fiches", "error")
  } finally {
    checkingExisting.value = false
  }
}

const forceCreateNew = () => {
  selectedPatient.value = null
  toast.add("Mode création activé (attention aux doublons)", "warning")
  // pour agent : on reste en étape 3 (famille) puis on pourra Continuer vers form
}

watch(patientType, (val) => {
  selectedAgent.value = null
  selectedPatient.value = null
  existingMatches.value = []
  relation.value = "SELF"
  typedChildName.value = ""

  if (reception.setPatientType) reception.setPatientType(val)

  step.value = 1
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- HEADER + GUIDE -->
    <div class="card space-y-3">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Réception — Admission Patient</h1>
          <p class="text-sm text-gray-500">
            Suivez les étapes ci-dessous — sections s’affichent / se cachent.
          </p>
          <BaseButton
            variant="secondary"
            @click="$router.push({ name: 'fiches.list' })"
            >
            Voir toutes les fiches
          </BaseButton>

          <div class="mt-3 flex flex-wrap gap-2">
            <BaseBadge type="primary">Step {{ step }}/{{ totalSteps }}</BaseBadge>

            <!-- paiement badge seulement si public -->
            <BaseBadge
              v-if="requiresPayment"
              :type="paymentOk ? 'success' : 'danger'"
            >
              Paiement: {{ paymentOk ? "validé" : "obligatoire" }}
            </BaseBadge>

            <BaseBadge type="warning">
              Type passage: {{ reception.draft?.typePassage || "NEW" }}
            </BaseBadge>

            <BaseBadge type="primary">
              Priorité: {{ reception.draft?.priorite || "ROUTINE" }}
            </BaseBadge>
          </div>
        </div>

        <div class="flex gap-2">
          <BaseButton variant="secondary" @click="goBack" :disabled="step === 1">
            Retour
          </BaseButton>
          <BaseButton variant="primary" @click="goNext" :disabled="step === totalSteps">
            Continuer
          </BaseButton>
        </div>
      </div>

      <div class="text-sm font-semibold">
        {{ stepTitle }}
      </div>

      <!-- mini guide dynamique -->
      <ol class="text-sm text-gray-600 list-decimal pl-6 space-y-1">
        <li :class="step>=1 ? 'text-gray-900' : ''">Choisir type patient (Agent / Public)</li>
        <li :class="step>=2 ? 'text-gray-900' : ''">
          Rechercher / sélectionner {{ patientType === 'agent' ? "un agent" : "un patient" }}
        </li>

        <li v-if="patientType==='agent'" :class="step>=3 ? 'text-gray-900' : ''">
          Ayant-droit + anti-doublon (famille)
        </li>

        <li v-else :class="step>=3 ? 'text-gray-900' : ''">
          Paiement fiche ({{ paymentRequiredNow ? "obligatoire" : "déjà payé" }})
        </li>

        <li :class="step>=4 ? 'text-gray-900' : ''">
          Créer / mettre à jour fiche patient
        </li>
      </ol>
    </div>

    <!-- STEP 1: TYPE -->
    <div v-if="step === 1" class="space-y-4">
      <PatientTypeSelector v-model="patientType" />
      <div class="flex justify-end">
        <BaseButton variant="primary" @click="goNext">
          Démarrer admission →
        </BaseButton>
      </div>
    </div>

    <!-- STEP 2: SEARCH -->
    <div v-if="step === 2" class="space-y-6">
      <div v-if="patientType === 'agent'" class="space-y-6">
        <AgentSearch @selectAgent="handleAgent" />

        <div v-if="selectedAgent" class="text-sm text-green-700">
          ✓ Agent sélectionné : {{ selectedAgent.nom_post }} ({{ selectedAgent.cac_id_co }})
        </div>

        <div class="flex justify-end">
          <BaseButton variant="primary" @click="goNext" :disabled="!selectedAgent">
            Continuer →
          </BaseButton>
        </div>
      </div>

      <div v-else class="space-y-6">
        <PatientSearch @selectPatient="handlePatient" />

        <div v-if="selectedPatient" class="text-sm text-green-700">
          ✓ Patient sélectionné : {{ selectedPatient.nom }} {{ selectedPatient.prenom }}
        </div>

        <div class="flex justify-end">
          <BaseButton variant="primary" @click="goNext">
            Continuer →
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- STEP 3: AGENT FAMILY / CHECK -->
    <div v-if="step === 3 && patientType === 'agent'" class="space-y-6">
      <AgentResultCard
        v-if="selectedAgent"
        :agent="selectedAgent"
        @chooseRelation="chooseRelation"
      />

      <div v-if="selectedAgent" class="card space-y-3">
        <div class="font-semibold">Ayant-droit / Famille</div>

        <div class="grid gap-3 md:grid-cols-3">
          <div class="md:col-span-1">
            <label class="text-sm text-gray-600">Relation</label>
            <div class="border rounded px-3 py-2 bg-gray-50">
              {{ relation }}
            </div>
          </div>

          <div v-if="relation === 'CHILD'" class="md:col-span-2">
            <label class="text-sm text-gray-600">Nom de l’enfant</label>
            <input
              v-model="typedChildName"
              placeholder="Ex: Junior Kabamba"
              class="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <BaseButton
            variant="secondary"
            :loading="checkingExisting"
            @click="checkExisting"
          >
            Vérifier fiches existantes
          </BaseButton>
        </div>

        <div v-if="existingMatches.length > 0" class="space-y-2">
          <div class="text-sm text-gray-600">
            Fiches existantes possibles — sélectionne pour ouvrir :
          </div>

          <div class="grid gap-2">
            <button
              v-for="p in existingMatches"
              :key="p.id"
              type="button"
              class="border rounded p-3 hover:bg-gray-50 text-left"
              :disabled="openingPatient"
              @click="handlePatient(p)"
            >
              <div class="font-semibold">
                {{ p.nom }} {{ p.prenom }}
                <span class="text-xs text-gray-500">(#{{ p.id }})</span>
              </div>
              <div class="text-xs text-gray-600">
                Tel: {{ p.telephone || "-" }} • Num: {{ p.numero_patient || "-" }}
              </div>
            </button>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <BaseButton variant="danger" @click="forceCreateNew">
              Créer une nouvelle fiche quand même
            </BaseButton>
          </div>
        </div>

        <div v-if="selectedPatient" class="text-sm text-green-700">
          ✓ Fiche ouverte : {{ selectedPatient.nom }} {{ selectedPatient.prenom }}
        </div>
      </div>

      <div class="flex justify-end">
        <BaseButton variant="primary" @click="goNext">
          Continuer →
        </BaseButton>
      </div>
    </div>

    <!-- STEP 3: PUBLIC PAYMENT -->
    <div v-if="step === 3 && patientType === 'public' && paymentRequiredNow" class="space-y-6">
      <FichePayment />

      <div class="flex justify-end">
        <BaseButton variant="primary" @click="goNext" :disabled="!paymentOk">
          Continuer →
        </BaseButton>
      </div>

      <div v-if="!paymentOk" class="text-sm text-red-600">
        Paiement obligatoire avant d’accéder au formulaire.
      </div>
    </div>

    <!-- Si step=3 mais paiement non requis (déjà payé) => on pousse direct au form -->
    <div v-if="step === 3 && patientType === 'public' && !paymentRequiredNow" class="card">
        <div class="text-green-700 text-sm">
            ✓ Fiche déjà payée — passage direct au formulaire.
        </div>
        <div class="mt-3 flex justify-end">
            <BaseButton variant="primary" @click="step = 4">
            Continuer →
            </BaseButton>
        </div>
    </div>

    <!-- STEP 4: FORM -->
    <div v-if="step === 4" class="space-y-6">
      <PatientForm
        v-if="patientType === 'agent'"
        :agent="selectedAgent"
        :patient="selectedPatient"
        :relation="relation"
        :typedChildName="typedChildName"
        @saved="resetFlow"
      />
      <PatientForm v-else :patient="selectedPatient" @saved="resetFlow" />
    </div>
  </div>
</template>