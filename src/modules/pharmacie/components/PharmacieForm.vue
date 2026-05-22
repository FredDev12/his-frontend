<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

const props = defineProps({
  initialValue: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  prefillContext: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: 'Créer prescription',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  medicaments: [
    {
      medicament: '',
      dosage: '',
      frequence: '',
      duree: '',
      quantite: 1,
      instructions: '',
      delivre: false,
    },
  ],
})

const errors = reactive({})

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    if (Array.isArray(value.medicaments) && value.medicaments.length > 0) {
      form.medicaments = value.medicaments.map((item) => ({
        medicament: item.medicament || '',
        dosage: item.dosage || '',
        frequence: item.frequence || '',
        duree: item.duree || '',
        quantite: item.quantite || 1,
        instructions: item.instructions || '',
        delivre: Boolean(item.delivre),
      }))
    }
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function addMedicament() {
  form.medicaments.push({
    medicament: '',
    dosage: '',
    frequence: '',
    duree: '',
    quantite: 1,
    instructions: '',
    delivre: false,
  })
}

function removeMedicament(index) {
  if (form.medicaments.length === 1) return
  form.medicaments.splice(index, 1)
}

function validate() {
  clearErrors()

  form.medicaments.forEach((item, index) => {
    if (!item.medicament) {
      errors[`medicament_${index}`] = 'Nom du médicament obligatoire.'
    }

    if (!item.dosage) {
      errors[`dosage_${index}`] = 'Dosage obligatoire.'
    }

    if (!item.frequence) {
      errors[`frequence_${index}`] = 'Fréquence obligatoire.'
    }

    if (!item.duree) {
      errors[`duree_${index}`] = 'Durée obligatoire.'
    }
  })

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    medicaments: form.medicaments.map((item) => ({
      medicament: item.medicament,
      dosage: item.dosage,
      frequence: item.frequence,
      duree: item.duree,
      quantite: Number(item.quantite) || 1,
      instructions: item.instructions || undefined,
      delivre: Boolean(item.delivre),
    })),
  }
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard
      title="Médicaments prescrits"
      subtitle="Ajoute un ou plusieurs médicaments avec dosage, fréquence, durée et quantité."
    >
      <div class="space-y-4">
        <div
          v-for="(item, index) in form.medicaments"
          :key="index"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="mb-4 flex items-center justify-between gap-3">
            <h3 class="font-semibold text-slate-900">Médicament {{ index + 1 }}</h3>

            <BaseButton
              v-if="form.medicaments.length > 1"
              type="button"
              variant="danger"
              size="sm"
              @click="removeMedicament(index)"
            >
              Retirer
            </BaseButton>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BaseInput
              v-model="item.medicament"
              label="Médicament"
              placeholder="Paracétamol, Artésunate..."
              required
              :error="errors[`medicament_${index}`]"
            />

            <BaseInput
              v-model="item.dosage"
              label="Dosage"
              placeholder="500 mg"
              required
              :error="errors[`dosage_${index}`]"
            />

            <BaseInput
              v-model="item.frequence"
              label="Fréquence"
              placeholder="3 fois par jour"
              required
              :error="errors[`frequence_${index}`]"
            />

            <BaseInput
              v-model="item.duree"
              label="Durée"
              placeholder="5 jours"
              required
              :error="errors[`duree_${index}`]"
            />

            <BaseInput v-model="item.quantite" label="Quantité" type="number" />

            <label
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <input
                v-model="item.delivre"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <span class="text-sm font-medium text-slate-700"> Déjà délivré </span>
            </label>

            <div class="md:col-span-2 xl:col-span-4">
              <BaseTextarea
                v-model="item.instructions"
                label="Instructions"
                placeholder="À prendre après le repas..."
                :rows="2"
              />
            </div>
          </div>
        </div>
      </div>

      <template #actions>
        <BaseButton type="button" variant="secondary" @click="addMedicament">
          Ajouter médicament
        </BaseButton>
      </template>
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton type="submit" :loading="loading">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
