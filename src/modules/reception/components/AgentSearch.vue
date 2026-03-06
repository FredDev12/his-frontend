<script setup>
import { ref } from "vue"
import { searchAgents } from "../../../api/agents.api"
import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"
import { useToastStore } from "../../../stores/toast.store"

const query = ref("")
const agents = ref([])
const selectedCacId = ref(null)

const searching = ref(false)
const hasSearched = ref(false)

const toast = useToastStore()
const emit = defineEmits(["selectAgent"])

const normalize = (q) => (q || "").toString().trim().replace(/\s+/g, " ")

const search = async () => {
  const q = normalize(query.value)

  if (q.length < 2) {
    agents.value = []
    hasSearched.value = true
    return toast.add("Tape au moins 2 caractères", "info")
  }

  searching.value = true
  hasSearched.value = true

  try {
    const res = await searchAgents({ nom_post: q })
    agents.value = res?.data?.data || []
    toast.add(`${agents.value.length} agents trouvés`, "info")
  } catch (err) {
    agents.value = []
    toast.add("Erreur recherche agent", "error")
  } finally {
    searching.value = false
  }
}

const pick = (agent) => {
  selectedCacId.value = agent.cac_id_co
  emit("selectAgent", agent)

  query.value = ""
  agents.value = []
}
</script>

<template>
  <div class="card space-y-4">
    <!-- Search Bar -->
    <div class="flex items-end gap-3">
      <div class="flex-1">
        <label class="text-sm text-gray-600">Recherche Agent CAC</label>

        <!-- ✅ enlever :modelValue, v-model suffit -->
        <BaseInput
          v-model="query"
          placeholder="Nom de l'agent (ex: MONTEIRO)"
        />
      </div>

      <BaseButton variant="primary" @click="search" :disabled="searching">
        {{ searching ? "..." : "Rechercher" }}
      </BaseButton>
    </div>

    <!-- Results -->
    <div
      v-if="agents.length > 0"
      class="border rounded-md max-h-80 overflow-y-auto p-2 space-y-2"
    >
      <!-- header sticky (optionnel mais pro) -->
      <div class="sticky top-0 bg-white border-b p-2 text-xs text-gray-500 z-10">
        Résultats ({{ agents.length }}) — clique pour sélectionner
      </div>

      <button
        v-for="a in agents"
        :key="a.cac_id_co"
        type="button"
        class="w-full text-left border rounded p-3 hover:bg-gray-50 transition"
        :class="selectedCacId === a.cac_id_co ? 'ring-2 ring-blue-300 bg-blue-50/40' : ''"
        @click="pick(a)"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="font-semibold">
              {{ a.nom_post }} {{ a.prenom && a.prenom !== 'null' ? a.prenom : '' }}
              <span class="text-xs text-gray-500">({{ a.cac_id_co }})</span>
            </div>

            <div class="text-sm text-gray-600">
              {{ a.fonction }} — {{ a.site }}
            </div>
          </div>

          <div class="flex gap-2">
            <BaseBadge type="primary">{{ a.sexe }}</BaseBadge>
            <BaseBadge v-if="a.statut_marital && a.statut_marital !== '-'" type="success">
              {{ a.statut_marital }}
            </BaseBadge>
          </div>
        </div>

        <div class="mt-2 text-xs text-gray-600">
          <span class="font-medium">Conjoint:</span> {{ a.nom_conjoint || "-" }}
          <span class="mx-2">•</span>
          <span class="font-medium">Enfants:</span> {{ a.nbre_enfa || "0" }}
          <span class="mx-2">•</span>
          <span class="font-medium">Parents:</span> {{ a.parents || "-" }}
        </div>
      </button>
    </div>

    <!-- Empty state only after search -->
    <div v-else-if="hasSearched && !searching" class="text-sm text-gray-500">
      Aucun résultat
    </div>
  </div>
</template>