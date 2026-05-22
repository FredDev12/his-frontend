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
    default: 'Créer demande laboratoire',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  examens: [
    {
      examen: '',
      date: new Date().toISOString().split('T')[0],
      resultat: '',
    },
  ],
})

const errors = reactive({})

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    if (Array.isArray(value.examens) && value.examens.length > 0) {
      form.examens = value.examens.map((exam) => ({
        examen: exam.examen || '',
        date: exam.date || new Date().toISOString().split('T')[0],
        resultat: exam.resultat || '',
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
    examen: '',
    date: new Date().toISOString().split('T')[0],
    resultat: '',
  })
}

function removeExam(index) {
  if (form.examens.length === 1) return
  form.examens.splice(index, 1)
}

function validate() {
  clearErrors()

  form.examens.forEach((exam, index) => {
    if (!exam.examen) {
      errors[`examen_${index}`] = 'Nom de l’examen obligatoire.'
    }
  })

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    examens: form.examens.map((exam) => ({
      examen: exam.examen,
      date: exam.date || undefined,
      resultat: exam.resultat || undefined,
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
      title="Examens demandés"
      subtitle="Ajoute un ou plusieurs examens de laboratoire. Le résultat peut être saisi plus tard."
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

          <div class="grid gap-4 md:grid-cols-3">
            <BaseInput
              v-model="exam.examen"
              label="Nom de l’examen"
              placeholder="Goutte épaisse, NFS, Glycémie..."
              required
              :error="errors[`examen_${index}`]"
            />

            <BaseInput v-model="exam.date" label="Date" type="date" />

            <BaseTextarea
              v-model="exam.resultat"
              label="Résultat"
              placeholder="Résultat à saisir..."
              :rows="2"
            />
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
