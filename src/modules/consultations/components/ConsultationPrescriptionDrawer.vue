<script setup>
import {
  reactive,
  ref,
  watch,
} from 'vue'

import {
  createEmptyPrescriptionLine,
  createPrescriptionDraft,
  MAX_PRESCRIPTION_LINES,
} from '@/modules/consultations/policies/consultation-prescription-ui.policy'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import Drawer from '@/shared/ui/overlay/Drawer.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  consultation: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'close',
  'review',
])

const form = reactive({
  clinicalNotes: '',
  lines: [
    createEmptyPrescriptionLine(),
  ],
})

const localError = ref('')

function reset() {
  form.clinicalNotes = ''
  form.lines = [
    createEmptyPrescriptionLine(),
  ]
  localError.value = ''
}

watch(
  () => props.open,
  (open) => {
    if (open) reset()
  },
)

function addLine() {
  if (
    props.loading ||
    form.lines.length >=
      MAX_PRESCRIPTION_LINES
  ) {
    return
  }

  form.lines.push(
    createEmptyPrescriptionLine(),
  )
}

function removeLine(index) {
  if (
    props.loading ||
    form.lines.length <= 1
  ) {
    return
  }

  form.lines.splice(index, 1)
}

function submit() {
  localError.value = ''

  try {
    emit(
      'review',
      createPrescriptionDraft(form),
    )
  } catch (error) {
    localError.value =
      error?.message ||
      'Prescription invalide.'
  }
}
</script>

<template>
  <Drawer
    :open="open"
    title="Prescrire un traitement"
    :subtitle="
      consultation
        ? `${consultation.consultation_code} · ${consultation.nom || ''} ${consultation.postnom || ''} ${consultation.prenom || ''}`.trim()
        : ''
    "
    width-class="max-w-4xl"
    @close="emit('close')"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <div
        class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
      >
        La prescription sera rattachée
        automatiquement à cette consultation,
        à son épisode et au patient. Le médecin
        prescripteur et le service sont vérifiés
        par le backend.
      </div>

      <BaseTextarea
        v-model="form.clinicalNotes"
        label="Notes cliniques"
        placeholder="Précisez les éléments utiles à la prescription..."
        :rows="3"
        :disabled="loading"
      />

      <section class="space-y-4">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3
              class="text-base font-bold text-slate-950"
            >
              Médicaments
            </h3>
            <p
              class="mt-1 text-sm text-slate-600"
            >
              {{ form.lines.length }}
              ligne(s) sur
              {{ MAX_PRESCRIPTION_LINES }}
              maximum.
            </p>
          </div>

          <BaseButton
            variant="secondary"
            :disabled="
              loading ||
              form.lines.length >=
                MAX_PRESCRIPTION_LINES
            "
            @click="addLine"
          >
            Ajouter un médicament
          </BaseButton>
        </div>

        <article
          v-for="(line, index) in form.lines"
          :key="index"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div
            class="mb-4 flex items-center justify-between gap-3"
          >
            <h4
              class="text-sm font-bold text-slate-900"
            >
              Médicament {{ index + 1 }}
            </h4>

            <BaseButton
              variant="danger"
              :disabled="
                loading ||
                form.lines.length <= 1
              "
              @click="removeLine(index)"
            >
              Retirer
            </BaseButton>
          </div>

          <div
            class="grid gap-4 md:grid-cols-2"
          >
            <BaseInput
              v-model="line.medicationName"
              label="Médicament"
              placeholder="Ex. Paracétamol"
              required
              :disabled="loading"
            />

            <BaseInput
              v-model="line.dosage"
              label="Dosage"
              placeholder="Ex. 500 mg"
              required
              :disabled="loading"
            />

            <BaseInput
              v-model="line.frequency"
              label="Fréquence"
              placeholder="Ex. 3 fois/jour"
              required
              :disabled="loading"
            />

            <BaseInput
              v-model="line.duration"
              label="Durée"
              placeholder="Ex. 3 jours"
              required
              :disabled="loading"
            />

            <BaseInput
              v-model="line.quantity"
              label="Quantité"
              type="number"
              placeholder="Ex. 9"
              required
              :disabled="loading"
            />

            <BaseInput
              v-model="line.instructions"
              label="Instructions"
              placeholder="Ex. Après repas"
              :disabled="loading"
            />
          </div>
        </article>
      </section>

      <div
        v-if="localError"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        role="alert"
      >
        {{ localError }}
      </div>

      <div
        class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end"
      >
        <BaseButton
          variant="secondary"
          :disabled="loading"
          @click="emit('close')"
        >
          Annuler
        </BaseButton>

        <BaseButton
          type="submit"
          :disabled="loading"
        >
          Vérifier la prescription
        </BaseButton>
      </div>
    </form>
  </Drawer>
</template>
