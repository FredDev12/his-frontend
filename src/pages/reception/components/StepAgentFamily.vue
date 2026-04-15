<script setup>
import AgentResultCard from "../../../modules/reception/components/AgentResultCard.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseInput from "../../../components/ui/BaseInput.vue";

const props = defineProps({
  selectedAgent: Object,
  selectedPatient: Object,
  relation: String,
  typedChildName: String,
  existingMatches: Array,
  checkingExisting: Boolean,
  openingPatient: Boolean,
  patientType:String
})

const emit = defineEmits([
  "chooseRelation", 
  "checkExisting", 
  "handlePatient", 
  "forceCreateNew",
  "next",
  "update:typedChildName",
  "patientType"
])
</script>

<template>
  <div class="space-y-6">
    <AgentResultCard
      v-if="selectedAgent"
      :agent="selectedAgent"
      @chooseRelation="$emit('chooseRelation', $event)"
    />

    <div v-if="selectedAgent" class="bg-gray-50 rounded-lg p-5 space-y-4">
      <h3 class="font-semibold text-gray-800">Ayant-droit / Famille</h3>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="md:col-span-1">
          <label class="text-sm font-medium text-gray-600 mb-1 block">Relation</label>
          <div class="bg-white border rounded-lg px-4 py-2.5 text-gray-700">
            {{ relation }}
          </div>
        </div>

        <div v-if="relation === 'CHILD'" class="md:col-span-2">
          <BaseInput
            :modelValue="typedChildName"
            @update:modelValue="$emit('update:typedChildName', $event)"
            label="Nom de l’enfant"
            placeholder="Ex: Junior Kabamba"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton
          variant="secondary"
          :loading="checkingExisting"
          @click="$emit('checkExisting')"
        >
          🔍 Vérifier les doublons
        </BaseButton>
      </div>

      <div v-if="existingMatches.length > 0" class="space-y-3">
        <p class="text-sm text-gray-600">Des fiches existantes ont été trouvées :</p>

        <div class="grid gap-2">
          <button
            v-for="p in existingMatches"
            :key="p.id"
            type="button"
            class="w-full bg-white border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm text-left transition"
            :disabled="openingPatient"
            @click="$emit('handlePatient', p)"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="font-semibold">{{ p.nom }} {{ p.prenom }}</span>
                <span class="text-xs text-gray-500 ml-2">#{{ p.id }}</span>
              </div>
              <span class="text-blue-600 text-sm">Ouvrir →</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Tél: {{ p.telephone || "-" }} • N°: {{ p.numero_patient || "-" }}
            </div>
          </button>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <BaseButton variant="danger" @click="$emit('forceCreateNew')">
            Créer une nouvelle fiche
          </BaseButton>
        </div>
      </div>

      <div v-if="selectedPatient" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
          <div>
            <p class="font-medium text-green-800">Fiche ouverte</p>
            <p class="text-sm text-green-600">{{ selectedPatient.nom }} {{ selectedPatient.prenom }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <BaseButton variant="primary" @click="$emit('next')">
        Continuer →
      </BaseButton>
    </div>
  </div>
</template>