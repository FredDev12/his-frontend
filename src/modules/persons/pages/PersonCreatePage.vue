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

  type_passage: "NEW",
  service_entree: "",
  priorite: "ROUTINE",

  montant_fiche: 0,
  paiement_effectue: false,
  mode_paiement: "CASH"
})


// ==========================
// FACTURATION
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
    postnom: parts.slice(1).join(" ") || ""
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

  // UX automatique
  if (age < 15) {
    form.service_entree = "PEDIATRIE"
  }
})

const isSelfAgent = computed(()=> {
  return form.type_relation
})

// ==========================
// AGENT
// ==========================
const agentId = route.query.agent
form.type_relation = route.query.type

watch(agent, (newAgent) => {
  if (!newAgent) return

  const { nom, postnom } = splitName(newAgent.nom_post)

  form.nom = nom
  form.postnom = postnom
  form.prenom = newAgent.prenom || ""
  form.telephone = (newAgent.telephone || "").replace(/-/g, "").replace(/\s/g, "")
  form.adresse = newAgent.adresse || ""
  form.date_naissance = newAgent.date_de_naissance || ""
  form.etat_civil = newAgent.statut_marital || ""
  form.sexe = newAgent.sexe || "M"
  form.agent_id = newAgent.id
}, { immediate: true })


watch(isSelfAgent, (isSelf) => {
  if (isSelf) {
    form.montant_fiche = 0
    form.paiement_effectue = false
    form.mode_paiement = null

    facturationValidee.value = true
    facturationData.value = null
  } else {
    facturationValidee.value = false
  }
}, { immediate: true })

// ==========================
// INIT
// ==========================
onMounted(async () => {
  if (agentId) {
    const r = await agentStore.fetchAgentById(agentId)
    agent.value = r.data
  }

  form.type_relation = route.query.type || ""

  if (form.type_relation === "enfant") {
    form.service_entree = "PEDIATRIE"
  }

  if (form.type_relation === "conjoint") {
    form.etat_civil = "MARIÉ(E)"
  }
})

// ==========================
// BADGE RELATION
// ==========================
const relationBadgeType = computed(() => {
  switch (form.type_relation) {
    case "conjoint": return "primary"
    case "enfant": return "warning"
    case "parent": return "danger"
    default: return "success"
  }
})

const appliquerNumeroFiche = () => {
  if (!form.numero_fiche) {
    toast.add("Veuillez saisir un numéro de fiche", "info", "center", 4000)
    return
  }

  numeroFicheValide.value = true
  toast.add(`Numéro de fiche ${form.numero_fiche} appliqué ✅`, "success", "top-right", 3000)

}

// ==========================
// FACTURATION
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
// SUBMIT
// ==========================
const submit = async () => {
  try {
    if (!isSelfAgent.value && !facturationValidee.value) {
      toast.add("Veuillez valider la facturation", "warning", "center", 4000)
      return
    }

    await patientsStore.addPatient(form)
    toast.add("Patient créé avec succès ✅", "success", "top-right", 4000)
    //router.push("/reception")
  } catch (e) {
    console.error(e)
    toast.add(`Erreur lors de la création ${e.message || e}`, "error", "center", 5000)
  }
}
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
    <div v-if="agent && !isSelfAgent" class="mb-6 p-4 bg-blue-50 border rounded">
      <h2 class="font-bold text-lg mb-2">Agent lié</h2>

      <div class="grid grid-cols-2 gap-2 text-sm">
        <p><strong>Nom :</strong> {{ agent.nom_post }} {{ agent.prenom }}</p>
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

        <span class="px-3 py-1 bg-gray-100 border rounded font-mono text-sm">
          {{ form.numero_fiche || "AUTO" }}
        </span>
      </div>

    </div>

    <!-- INPUT + BOUTON -->
    <div v-if="!numeroFicheValide" class="flex items-end gap-2">

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
          <BaseInput v-model="form.nom" label="Nom" disabled />
          <BaseInput v-model="form.postnom" label="Postnom" disabled />
          <BaseInput v-model="form.prenom" label="Prénom" disabled />

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
          <BaseInput v-model="form.etat_civil" label="État civil" />
          <BaseInput v-model="form.telephone" label="Téléphone" />

          <BaseInput v-model="form.adresse" label="Adresse" class="col-span-2" />
        </div>
      </section>

      <!-- CONTACT -->
      <section>
        <h3 class="font-semibold mb-3">Contact d'urgence</h3>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.personne_a_contacter" label="Personne à contacter" />
          <BaseInput v-model="form.telephone_urgence" label="Téléphone urgence" />
        </div>
      </section>

      
      <!-- FACTURATION -->
      <section v-if="agent && !isSelfAgent && !agent.cac_id_co">
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

      <!-- ACTION -->
      <BaseButton type="submit" :loading="patientsStore.loading" class="w-full">
        Créer le patient
      </BaseButton>

    </form>

    <FacturationModal
      :show="showFacturationModal"
      :reception_id="form.agent_id"
      @close="showFacturationModal = false"
      @validate="handleFacturationValidate"
    />

  </div>
</template>