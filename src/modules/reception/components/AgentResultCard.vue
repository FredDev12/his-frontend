<script setup>
import { ref, computed } from "vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"

const props = defineProps({
  agent: Object
})

const emit = defineEmits(["chooseRelation"])

const relation = ref("SELF")

const spouseAvailable = computed(() => {
  if (!props.agent) return false
  const n = (props.agent.nom_conjoint || "").trim()
  return n && n !== "-" && n.toLowerCase() !== "null"
})

const parentsAvailable = computed(() => {
  if (!props.agent) return false
  const p = (props.agent.parents || "").trim()
  return p && p !== "-" && p.toLowerCase() !== "null"
})

const choose = () => emit("chooseRelation", relation.value)
</script>

<template>
  <div v-if="agent" class="card space-y-4">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="text-lg font-bold">
          {{ agent.nom_post }} {{ agent.prenom }}
        </div>
        <div class="text-sm text-gray-600">
          {{ agent.fonction }} — {{ agent.site }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          CAC ID: <span class="font-medium">{{ agent.cac_id_co }}</span> • Tel: {{ agent.telephone || "-" }}
        </div>
      </div>

      <div class="flex gap-2">
        <BaseBadge type="primary">{{ agent.sexe }}</BaseBadge>
        <BaseBadge v-if="agent.nationalite" type="warning">{{ agent.nationalite }}</BaseBadge>
      </div>
    </div>

    <div class="border rounded p-3 bg-gray-50">
      <div class="font-semibold mb-2">Famille (données CAC)</div>

      <div class="text-sm space-y-1">
        <div><span class="font-medium">Statut marital:</span> {{ agent.statut_marital || "-" }}</div>

        <div>
          <span class="font-medium">Conjoint:</span>
          {{ agent.nom_conjoint || "-" }}
          <BaseBadge v-if="spouseAvailable" type="success" class="ml-2">disponible</BaseBadge>
        </div>

        <div><span class="font-medium">Nombre d’enfants:</span> {{ agent.nbre_enfa || "0" }}</div>

        <div>
          <span class="font-medium">Parents:</span>
          {{ agent.parents || "-" }}
          <BaseBadge v-if="parentsAvailable" type="success" class="ml-2">disponible</BaseBadge>
        </div>

        <div class="text-xs text-gray-500 mt-2">
          NB: Liaison HIS (patient↔agent) pas encore native côté Patients.
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <label class="text-sm text-gray-600">Créer/Ouvrir fiche pour :</label>

      <select v-model="relation" class="border rounded px-3 py-2">
        <option value="SELF">Agent</option>
        <option value="SPOUSE">Conjoint</option>
        <option value="CHILD">Enfant</option>
        <option value="PARENT">Parent</option>
      </select>

      <BaseButton variant="primary" @click="choose">
        Continuer
      </BaseButton>
    </div>
  </div>
</template>