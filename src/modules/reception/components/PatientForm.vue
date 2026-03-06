<script setup>
import { ref, watch, computed } from "vue"
import { createPatient, updatePatient } from "../../../api/patients.api"
import { useToastStore } from "../../../stores/toast.store"
import { useReceptionStore } from "../../../stores/reception.store"

import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"

const toast = useToastStore()
const reception = useReceptionStore()

const props = defineProps({
  agent: Object,
  patient: Object,
  relation: { type: String, default: "SELF" }, // SELF | SPOUSE | CHILD | PARENT
  typedChildName: { type: String, default: "" }
})

const saving = ref(false)

// Champs API Patients
const nom = ref("")
const prenom = ref("")
const sexe = ref("") // "M" | "F" | ""
const date_naissance = ref("")
const age = ref("")
const telephone = ref("")
const adresse = ref("")
const urgence = ref(false)

const emit = defineEmits(["saved"])

// Services API (4 bool)
const medecine_interne = ref(false)
const pediatrie = ref(false)
const gyneco_obstetrique = ref(false)
const chirurgie = ref(false)

const isEdit = computed(() => !!props.patient?.id)

// Helpers
const safe = (v) => {
  const s = (v ?? "").toString().trim()
  return s.toLowerCase() === "null" ? "" : s
}
const normalizeSpaces = (s) => safe(s).replace(/\s+/g, " ").trim()

// split "NOM PRENOM" best-effort
const splitFullName = (full) => {
  const s = normalizeSpaces(full)
  if (!s) return { nom: "", prenom: "" }
  const parts = s.split(" ")
  if (parts.length === 1) return { nom: s, prenom: "" }
  // choix simple : dernier mot = prenom, reste = nom
  return { nom: parts.slice(0, -1).join(" "), prenom: parts.slice(-1).join(" ") }
}

const guessSexe = (agentSexe) => {
  const s = normalizeSpaces(agentSexe).toUpperCase()
  if (s === "M" || s === "H" || s.includes("MASC")) return "M"
  if (s === "F" || s.includes("FEM")) return "F"
  return ""
}

const setDefaultServicesFromDraft = () => {
 // si création et draft avec typePassage/priorite, on pré-remplit les services d’entrée pour gagner du temps
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

  // services
  medecine_interne.value = !!p?.medecine_interne
  pediatrie.value = !!p?.pediatrie
  gyneco_obstetrique.value = !!p?.gyneco_obstetrique
  chirurgie.value = !!p?.chirurgie
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
    // parents est une phrase "PERE ET MERE" => on pré-remplit le champ nom, l’utilisateur corrige
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

  setDefaultServicesFromDraft()
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

  medecine_interne: !!medecine_interne.value,
  pediatrie: !!pediatrie.value,
  gyneco_obstetrique: !!gyneco_obstetrique.value,
  chirurgie: !!chirurgie.value
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
    // si edit, on ne sur-écrit pas les champs
    if (!a || edit) return
    loadFromAgent(a)
  },
  { immediate: true }
)

const submit = async () => {
  // 🔒 Paiement obligatoire (UI only pour l’instant)
  if (!reception.paymentValidated) {
    toast.add("Paiement fiche obligatoire avant admission", "error")
    return
  }

  if (!validateApiFields()) return

  saving.value = true
  try {
    const payload = buildPayload()

    if (isEdit.value) {
      await updatePatient(props.patient.id, payload)
      toast.add("Fiche patient mise à jour", "success")
      emit("saved", { mode: "update", patientId: props.patient.id })
      return
    }

    await createPatient(payload)
    toast.add("Patient créé", "success")
    emit("saved", { mode: "create" })
  } catch (e) {
    toast.add("Erreur lors de l'enregistrement", "error")
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="card space-y-4">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="font-semibold">
          {{ isEdit ? "Fiche patient (existante)" : "Créer une fiche patient" }}
        </h2>

        <p v-if="agent" class="text-xs text-gray-500">
          Source: Agent CAC • Relation: {{ relation || "SELF" }}
        </p>

        <div class="mt-2 flex flex-wrap gap-2">
          <BaseBadge :type="reception.paymentValidated ? 'success' : 'danger'">
            Paiement: {{ reception.paymentValidated ? "validé" : "obligatoire" }}
          </BaseBadge>

          <BaseBadge type="warning">
            Type passage: {{ reception.draft?.typePassage || "NEW" }}
          </BaseBadge>

          <BaseBadge type="primary">
            Priorité: {{ reception.draft?.priorite || "ROUTINE" }}
          </BaseBadge>
        </div>
      </div>

      <div v-if="isEdit" class="text-xs text-green-700">
        ✓ Patient ID #{{ patient.id }}
      </div>
    </div>

    <!-- Identification (API) -->
    <div class="grid gap-3 md:grid-cols-2">
      <BaseInput label="Nom *" v-model="nom" />
      <BaseInput label="Prénom *" v-model="prenom" />
      <BaseInput label="Téléphone" v-model="telephone" />
      <BaseInput label="Sexe (M/F)" v-model="sexe" />
      <BaseInput label="Date de naissance (YYYY-MM-DD)" v-model="date_naissance" />
      <BaseInput label="Âge" v-model="age" />
      <BaseInput label="Adresse" v-model="adresse" />
    </div>

    <!-- Urgence -->
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" v-model="urgence" />
      Urgence
    </label>

    <!-- Service d’entrée (API: 4 bool) -->
    <div class="border rounded p-3 bg-gray-50 space-y-2">
      <div class="font-semibold text-sm">Service d’entrée (MVP API)</div>
      <div class="grid gap-2 sm:grid-cols-2">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="medecine_interne" />
          Médecine interne
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="pediatrie" />
          Pédiatrie
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="gyneco_obstetrique" />
          Gynéco-obstétrique
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="chirurgie" />
          Chirurgie
        </label>
      </div>
      <div class="text-xs text-gray-500">
        Note: l’API ne fournit pas encore un champ unique <code>service_entree</code> ni les autres services.
      </div>
    </div>

    <!-- CTA -->
    <div class="flex gap-3">
      <BaseButton
        :loading="saving"
        :variant="isEdit ? 'primary' : 'success'"
        @click="submit"
      >
        {{ isEdit ? "Mettre à jour" : "Créer la fiche" }}
      </BaseButton>

      <div v-if="!reception.paymentValidated" class="text-xs text-red-600 self-center">
        Paiement obligatoire avant création.
      </div>
    </div>

    <div class="text-xs text-gray-500">
      ⚠️ Le lien officiel Patient↔Agent CAC (SELF/SPOUSE/CHILD/PARENT) n’est pas encore stockable côté API.
      Le front applique un anti-doublon “best effort” via recherche.
    </div>
  </div>
</template>