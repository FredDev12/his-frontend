<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
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
    default: 'Créer demande imagerie',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  examens: [
    {
      type: '',
      zone: '',
      indication: '',
      date: new Date().toISOString().split('T')[0],
      conclusion: '',
    },
  ],
})

const errors = reactive({})

const typeOptions = [
  { label: 'Radiographie', value: 'RADIOGRAPHIE' },
  { label: 'Échographie', value: 'ÉCHOGRAPHIE' },
  { label: 'Scanner', value: 'SCANNER' },
  { label: 'IRM', value: 'IRM' },
  { label: 'ECG', value: 'ECG' },
  { label: 'Autre', value: 'AUTRE' },
]

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    if (Array.isArray(value.examens) && value.examens.length > 0) {
      form.examens = value.examens.map((exam) => ({
        type: exam.type || exam.examen || '',
        zone: exam.zone || '',
        indication: exam.indication || '',
        date: exam.date || new Date().toISOString().split('T')[0],
        conclusion: exam.conclusion || exam.resultat || '',
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

function addExam() {
  form.examens.push({
    type: '',
    zone: '',
    indication: '',
    date: new Date().toISOString().split('T')[0],
    conclusion: '',
  })
}

function removeExam(index) {
  if (form.examens.length === 1) return
  form.examens.splice(index, 1)
}

function validate() {
  clearErrors()

  form.examens.forEach((exam, index) => {
    if (!exam.type) {
      errors[`type_${index}`] = 'Type d’examen obligatoire.'
    }

    if (!exam.indication) {
      errors[`indication_${index}`] = 'Indication obligatoire.'
    }
  })

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    examens: form.examens.map((exam) => ({
      //type: exam.type,
      examen: exam.type,
      zone: exam.zone || undefined,
      //indication: exam.indication,
      date: exam.date || undefined,
      conclusion: exam.conclusion || undefined,
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
      title="Examens d’imagerie"
      subtitle="Ajoute un ou plusieurs examens d’imagerie. La conclusion peut être saisie plus tard."
    >
      <div class="space-y-4">
        <div
          v-for="(exam, index) in form.examens"
          :key="index"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="mb-4 flex items-center justify-between gap-3">
            <h3 class="font-semibold text-slate-900">Examen {{ index + 1 }}</h3>

            <BaseButton
              v-if="form.examens.length > 1"
              type="button"
              variant="danger"
              size="sm"
              @click="removeExam(index)"
            >
              Retirer
            </BaseButton>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BaseSelect
              v-model="exam.type"
              label="Type d’examen"
              :options="typeOptions"
              required
              :error="errors[`type_${index}`]"
            />

            <BaseInput
              v-model="exam.zone"
              label="Zone / région"
              placeholder="Thorax, abdomen, bassin..."
            />

            <BaseInput v-model="exam.date" label="Date" type="date" />

            <div class="xl:col-span-4">
              <BaseTextarea
                v-model="exam.indication"
                label="Indication clinique"
                placeholder="Motif de la demande..."
                required
                :error="errors[`indication_${index}`]"
                :rows="2"
              />
            </div>

            <div class="xl:col-span-4">
              <BaseTextarea
                v-model="exam.conclusion"
                label="Conclusion / compte rendu"
                placeholder="Résultat ou compte rendu à saisir..."
                :rows="3"
              />
            </div>
          </div>
        </div>
      </div>

      <template #actions>
        <BaseButton type="button" variant="secondary" @click="addExam"> Ajouter examen </BaseButton>
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
