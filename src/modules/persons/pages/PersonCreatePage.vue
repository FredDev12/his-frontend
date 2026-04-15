<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAgentStore } from "../../reception/components/agents/stores/agents.store"
import { usePatientsStore } from "../../reception/components/patients/stores/patients.store"

import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseInput from "../../../components/ui/BaseInput.vue"
import RadioGroup from "../../../components/ui/RadioGroup.vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"
import FacturationModal from "../../caisse/components/facturation/FacturationModal.vue"
import { useToastStore } from "../../../stores/toast.store"

const router = useRouter()
const route = useRoute()
const toast = useToastStore()

const agentStore = useAgentStore()
const patientsStore = usePatientsStore()

const agent = ref(null)

// ==========================
// RELATIONS (SOURCE UNIQUE)
// ==========================
const RELATIONS = {
  AGENT: "agent",
  CONJOINT: "conjoint",
  ENFANT: "enfant",
  PUBLIC: "public"
}

// ==========================
// FORM
// ==========================
const form = reactive({
  agent_id: null,
  type_relation: "",
  numero_fiche: null,

  nom: "",
  prenom: "",
  postnom: "",
  sexe: "M",
  date_naissance: "",
  age: "",
  etat_civil: "",
  telephone: "",
  adresse: "",
  personne_a_contacter: "",
  telephone_urgence: "",
  lien: "",

  montant_fiche: 0,
  paiement_effectue: false,
  mode_paiement: "CASH",
  created_date: "",
  created_time: ""
})

// ==========================
// FACTURATION STATE
// ==========================
const showFacturationModal = ref(false)
const facturationValidee = ref(false)
const facturationData = ref(null)
const numeroFicheValide = ref(false)

// ==========================
// HELPERS
// ==========================
const splitName = (fullName = "") => {
  const parts = fullName.trim().split(" ")
  return {
    nom: parts[0] || "",
    postnom: parts.length > 1 ? parts[1] : "",
    prenom: parts.length > 2 ? parts.slice(2).join(" ") : ""
  }
}

// ==========================
// AGE AUTO
// ==========================
watch(() => form.date_naissance, (date) => {
  if (!date) return

  const today = new Date()
  const birth = new Date(date)

  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  form.age = String(age)
})

// ==========================
// TYPE RELATION INIT
// ==========================
const agentId = route.query.agent
form.type_relation = route.query.type || RELATIONS.PUBLIC

// ==========================
// FACTURATION LOGIC (CORRIGÉ)
// ==========================
const isAgentPrincipal = computed(() => {
  return form.type_relation === RELATIONS.AGENT
})

const isFacturationRequired = computed(() => {
  const type = form.type_relation

  if (!type || type === RELATIONS.PUBLIC) return true
  if (type === RELATIONS.AGENT) return false

  if ([RELATIONS.CONJOINT, RELATIONS.ENFANT].includes(type)) {
    return false
  }

  return true
})


// ==========================
// EDITABLE LOGIC
// ==========================
const isEditable = computed(() => {
  const type = form.type_relation

  // PUBLIC + ENFANT => modifiable
  if (type === RELATIONS.PUBLIC || type === RELATIONS.ENFANT) {
    return true
  }

  // CONJOINT => partiellement modifiable (tu peux adapter)
  if (type === RELATIONS.CONJOINT) {
    return true
  }

  // AGENT => généralement pré-rempli (non éditable)
  if (type === RELATIONS.AGENT) {
    return false
  }

  return true
})

// alias utile pour logique métier
const isSelfAgent = computed(() => {
  return form.type_relation === RELATIONS.AGENT
})


const isChildOrPublic = computed(() => {
  return [RELATIONS.ENFANT, RELATIONS.PUBLIC].includes(form.type_relation)
})

const isLocked = computed(() => {
  return form.type_relation === RELATIONS.AGENT
})

// ==========================
// AGENT WATCH
// ==========================
watch(agent, (newAgent) => {
  if (!newAgent) return

  const type = form.type_relation

  // CONJOINT
  if (type === RELATIONS.CONJOINT && newAgent.nom_conjoint) {
    const { nom, postnom, prenom } = splitName(newAgent.nom_conjoint)

    form.nom = nom
    form.postnom = postnom
    form.prenom = prenom
    form.lien = "Conjoint"

    form.sexe = "F"
    form.etat_civil = "Marié"

    form.adresse = newAgent.adresse || ""
    form.agent_id = newAgent.id
    form.personne_a_contacter = newAgent.nom_post
    form.telephone_urgence = (newAgent.telephone || "").replace(/\D/g, "")

    return
  }

  // ENFANT
  if (type === RELATIONS.ENFANT) {
    form.nom = newAgent.nom_post
    form.prenom = "Enfant"
    form.lien = "Enfant"

    form.sexe = "M"
    form.etat_civil = "Célibataire"

    form.adresse = newAgent.adresse || ""
    form.agent_id = newAgent.id
    form.personne_a_contacter = newAgent.nom_post
    form.telephone_urgence = (newAgent.telephone || "").replace(/\D/g, "")

    return
  }

  // AGENT / PUBLIC
  const { nom, postnom } = splitName(newAgent.nom_post)

  form.nom = nom
  form.postnom = postnom
  form.prenom = newAgent.prenom || ""
  form.telephone = (newAgent.telephone || "").replace(/\D/g, "")
  form.adresse = newAgent.adresse || ""
  form.date_naissance = newAgent.date_de_naissance || ""
  form.etat_civil = newAgent.statut_marital || ""
  form.sexe = newAgent.sexe || "M"
  form.agent_id = newAgent.id

}, { immediate: true })

// ==========================
// FACTURATION VALIDATION
// ==========================
const handleFacturationValidate = (data) => {
  facturationData.value = data
  facturationValidee.value = true
  showFacturationModal.value = false

  form.montant_fiche = data.montant_total
  form.mode_paiement = data.mode_paiement
  form.paiement_effectue = data.paiement_effectue

  

  toast.add("Facturation validée ✅", "success", "top-right", 3000)
}

// ==========================
// NUMERO FICHE
// ==========================
let compteur = 1

const auto = () => {
  const numero = compteur.toString().padStart(5, "0")
  form.numero_fiche = numero
  compteur++
  numeroFicheValide.value = true
}

const appliquerNumeroFiche = () => {
  if (!form.numero_fiche) {
    toast.add("Veuillez saisir un numéro de fiche", "info", "center", 4000)
    return
  }

  numeroFicheValide.value = true
}

// ==========================
// DATE TIME
// ==========================
const setNow = () => {
  const now = new Date()
  form.created_date = now.toISOString().split("T")[0]
  form.created_time = now.toTimeString().slice(0, 5)
}

// ==========================
// SUBMIT (CORRIGÉ)
// ==========================
const submit = async () => {
  try {
    if (isFacturationRequired.value && !facturationValidee.value) {
      toast.add("Veuillez valider la facturation", "warning", "center", 4000)
      return
    }

    if (!form.numero_fiche) {
      toast.add("Veuillez inserer le numéro de fiche", "warning", "center", 4000)
      return
    }

    await patientsStore.addPatient(form)

    toast.add("Patient créé avec succès ✅", "success", "top-right", 4000)
    router.push("/reception")

  } catch (e) {
    toast.add(`${e.response?.data.details}`, "error", "center", 6000)
    
    form.numero_fiche = ""
    numeroFicheValide.value = false
  }
}

const relationBadgeType = computed(() => {
  switch (form.type_relation) {
    case "agent":
      return "success"   // vert
    case "conjoint":
      return "info"      // bleu
    case "enfant":
      return "warning"   // jaune
    case "public":
      return "secondary" // gris
    default:
      return "secondary"
  }
})

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

const imprimerFichePDF = () => {
  try {
    const doc = new jsPDF()

    const getY = (defaultY = 30) => {
      return doc.lastAutoTable?.finalY
        ? doc.lastAutoTable.finalY + 10
        : defaultY
    }

    // ==========================
    // HEADER
    // ==========================
    doc.setFontSize(16)
    doc.text("FICHE DE CONSULTATION", 14, 15)

    doc.setFontSize(10)
    doc.text(`N° Fiche: ${form.numero_fiche || "-"}`, 14, 22)
    doc.text(
      `Date: ${form.created_date || "-"} ${form.created_time || ""}`,
      14,
      28
    )

    // ==========================
    // IDENTITÉ
    // ==========================
    autoTable(doc, {
      startY: 35,
      head: [["Champ", "Valeur"]],
      body: [
        ["Nom", form.nom || "-"],
        ["Postnom", form.postnom || "-"],
        ["Prénom", form.prenom || "-"],
        ["Sexe", form.sexe || "-"],
        ["Date naissance", form.date_naissance || "-"],
        ["Âge", form.age || "-"],
        ["État civil", form.etat_civil || "-"],
        ["Téléphone", form.telephone || "-"],
        ["Adresse", form.adresse || "-"],
      ],
    })

    // ==========================
    // CONTACT URGENCE
    // ==========================
    autoTable(doc, {
      startY: getY(),
      head: [["Contact urgence", "Détails"]],
      body: [
        ["Lien", form.lien || "-"],
        ["Personne", form.personne_a_contacter || "-"],
        ["Téléphone", form.telephone_urgence || "-"],
      ],
    })

    // ==========================
    // RELATION
    // ==========================
    autoTable(doc, {
      startY: getY(),
      head: [["Relation", "Valeur"]],
      body: [
        ["Type", form.type_relation || "-"],
        ["Agent ID", form.agent_id || "-"],
      ],
    })

    // ==========================
    // FACTURATION
    // ==========================
    if (isFacturationRequired.value) {
      autoTable(doc, {
        startY: getY(),
        head: [["Facturation", "Valeur"]],
        body: [
          ["Montant", `${form.montant_fiche || 0} USD`],
          ["Mode paiement", form.mode_paiement || "-"],
          ["Paiement effectué", form.paiement_effectue ? "Oui" : "Non"],
        ],
      })

      if (facturationData.value?.actes?.length) {
        autoTable(doc, {
          startY: getY(),
          head: [["Acte", "Montant"]],
          body: facturationData.value.actes.map(a => [
            a.libelle,
            `${a.montant} USD`
          ]),
        })
      }
    }

    // ==========================
    // FOOTER
    // ==========================
    doc.text(
      "Signature: __________________________",
      14,
      getY(250)
    )

    doc.text(
      "Cachet de l'hôpital",
      140,
      getY(250)
    )
    
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 180, 290)

    // ==========================
    // EXPORT
    // ==========================
    doc.save(`fiche_${form.numero_fiche || "consultation"}.pdf`)

  } catch (error) {
    console.error("Erreur PDF :", error)
    toast.add("Erreur lors de la génération du PDF", "error")
  }
}

// ==========================
// INIT
// ==========================
onMounted(async () => {
  setNow()

  await patientsStore.fetchPatients()

  if (agentId) {
    const r = await agentStore.fetchAgentById(agentId)
    agent.value = r.data
  }
})
</script>

<template>
  <div class="p-6 bg-white rounded shadow">

    <button
        @click="$router.push({path:'/reception', query:{ reset: 'true'}})"
        class="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
    >
        Retour
    </button>

    <!-- AGENT -->
    <div  v-if="agent && form.type_relation !== 'agent'" class="mb-6 p-4 bg-blue-50 border rounded">
      <h2 class="font-bold text-lg mb-2">Agent lié</h2>

      <div class="grid grid-cols-2 gap-2 text-sm">
        <p><strong>Nom :</strong> {{ agent.nom_post }}</p>
        <p><strong>Prénom :</strong> {{ agent.prenom }}</p>
        <p><strong>Téléphone :</strong> {{ agent.telephone }}</p>
        <p><strong>Fonction :</strong> {{ agent.fonction }}</p>
        <p><strong>Site :</strong> {{ agent.site }}</p>

      </div>

      <div v-if="form.type_relation" class="mt-2">
        <BaseBadge :type="relationBadgeType">
          {{ form.type_relation }}
        </BaseBadge>
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
  
      <h1 class="text-xl font-bold">
        Fiche de consultation
      </h1>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">N°</span>

        <span
          class="px-3 py-1 bg-gray-100 border rounded font-mono text-sm cursor-pointer hover:bg-gray-200"
          @click="auto"
          title="Générer automatiquement"

        >
          {{ form.numero_fiche || "AUTO" }}
        </span>
      </div>

    </div>

    <!-- INPUT + BOUTON -->
    <div v-if="!numeroFicheValide" class="flex items-end gap-2  mb-6">

      <BaseInput
        v-model="form.numero_fiche"
        label="Numéro fiche"
        placeholder="Ex: FC-001"
        class="flex-1"
      />

      <BaseButton type="button" @click="appliquerNumeroFiche">
        Appliquer
      </BaseButton>

    </div>

    <form @submit.prevent="submit" class="space-y-6">

      <!-- IDENTITÉ -->
      <section>
        <h3 class="font-semibold mb-3">Identité</h3>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.nom" label="Nom" :disabled="isLocked" :class="{ 'opacity-50 cursor-not-allowed': isLocked }"/>
          <BaseInput v-model="form.postnom" label="Postnom" :disabled="isLocked" :class="{ 'opacity-50 cursor-not-allowed': isLocked }" />
          <BaseInput v-model="form.prenom" label="Prénom" :disabled="isLocked" :class="{ 'opacity-50 cursor-not-allowed': isLocked }"/>

          <RadioGroup
            label="Sexe"
            v-model="form.sexe"
            :options="[
              { label: 'Masculin', value: 'M', color: 'blue' },
              { label: 'Féminin', value: 'F', color: 'pink' }
            ]"
          />

          <BaseInput v-model="form.date_naissance" type="date" label="Date de naissance" />
          <BaseInput v-model="form.age" label="Âge" disabled />
          <RadioGroup
            label="État civil"
            v-model="form.etat_civil"
            :options="[
              { label: 'Célibataire', value: 'Célibataire', color: 'blue' },
              { label: 'Marié', value: 'Marié', color: 'pink' },
              { label: 'Divorcé', value: 'Divorcé', color: 'green' },
              { label: 'Veuf', value: 'Veuf', color: 'yellow' }
            ]"/> 
          <BaseInput v-model="form.telephone" label="Téléphone" />

          <BaseInput v-model="form.adresse" label="Adresse" class="col-span-2" />
        </div>
      </section>

      <!-- CONTACT -->
      <section>
        <h3 class="font-semibold mb-3">Contact d'urgence</h3>

        <div class="grid grid-cols-2 gap-4">
          <RadioGroup
            label="type de lien"
            v-model="form.lien"
            :options="[
              { label: 'Conjoint', value: 'SPOUSE', color: 'pink' },
              { label: 'Enfant', value: 'CHILD', color: 'green' },
              { label: 'Parent', value: 'PARENT', color: 'yellow' }
            ]"/> 
          <BaseInput v-model="form.personne_a_contacter" label="Personne à contacter" />
          <BaseInput v-model="form.telephone_urgence" label="Téléphone urgence" />
        </div>
        <div class="flex items-end gap-2 py-5 col-span-2">          
          <BaseInput
            v-model="form.created_date"
            type="date"
            label="Date de création"
            class="flex-1"
          />
          <BaseInput
            v-model="form.created_time"
            type="time"
            label="heure de création"
            class="flex-1"
          />

          <BaseButton type="button" @click="setNow">
            Maintenant
          </BaseButton>

        </div>
      </section>

      
      <!-- FACTURATION -->
      <section v-if="isFacturationRequired">
        <h3 class="font-semibold mb-3">Facturation</h3>

        <div v-if="!facturationValidee">
          <BaseButton type="button" @click="showFacturationModal = true">
            💳 Valider la facturation
          </BaseButton>
        </div>

        <div v-else class="p-4 border rounded bg-green-50">
          <p><strong>Total :</strong> {{ facturationData?.montant_total }} USD</p>
          <p><strong>Mode :</strong> {{ facturationData?.mode_paiement }}</p>

          <ul class="list-disc ml-5 mt-2">
            <li v-for="(a, i) in facturationData?.actes" :key="i">
              {{ a.libelle }} - {{ a.montant }} USD
            </li>
          </ul>
        </div>
      </section>
      <!-- CAS SANS FACTURATION -->
      <div v-else class="text-sm text-gray-500 italic">
        Aucune facturation requise pour ce type de relation.
      </div>

      <!-- ACTION -->
      <div class="flex flex-col md:flex-row gap-3 mt-6">
        <BaseButton type="submit" :loading="patientsStore.loading" class="w-full">
          Créer le patient
        </BaseButton>
        <BaseButton @click="imprimerFichePDF" variant="secondary" class="w-full">
          🖨️ Imprimer la fiche
        </BaseButton>
      </div>

    </form>

    <FacturationModal
      :show="showFacturationModal"
      :reception_id="form.agent_id"
      @close="showFacturationModal = false"
      @validate="handleFacturationValidate"
    />

  </div>
</template>