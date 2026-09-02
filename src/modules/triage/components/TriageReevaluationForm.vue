<script setup>
import { computed, reactive } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

import {
  buildTriageReevaluationPayload,
  isVitalReevaluation,
  reevaluationPriorityOptions,
} from '@/modules/triage/workflow/triage-reevaluation.workflow'

const props = defineProps({
  triage: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  newPriority: '',

  temperatureCelsius: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  heartRate: '',
  respiratoryRate: '',
  oxygenSaturation: '',
  weightKg: '',
  heightCm: '',
  glucoseMgDl: '',
  painScore: '',

  clinicalNotes: '',
  vitalEmergencyConfirmed: false,
})

const errors = reactive({})

const priorityOptions = computed(() =>
  reevaluationPriorityOptions(props.triage.priorite),
)

const vitalEmergency = computed(() =>
  isVitalReevaluation(form),
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function inRange(value, min, max) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
}

function validate() {
  clearErrors()

  if (!form.newPriority) {
    errors.newPriority = 'Sélectionnez la priorité après réévaluation.'
  }

  if (!inRange(form.temperatureCelsius, 25, 45)) {
    errors.temperatureCelsius = 'Valeur attendue entre 25 et 45 °C.'
  }

  if (
    form.bloodPressureSystolic !== '' &&
    !inRange(form.bloodPressureSystolic, 40, 300)
  ) {
    errors.bloodPressureSystolic =
      'Valeur attendue entre 40 et 300.'
  }

  if (
    form.bloodPressureDiastolic !== '' &&
    !inRange(form.bloodPressureDiastolic, 20, 200)
  ) {
    errors.bloodPressureDiastolic =
      'Valeur attendue entre 20 et 200.'
  }

  if (!inRange(form.heartRate, 20, 250)) {
    errors.heartRate =
      'Valeur attendue entre 20 et 250 battements/min.'
  }

  if (!inRange(form.respiratoryRate, 5, 80)) {
    errors.respiratoryRate =
      'Valeur attendue entre 5 et 80 respirations/min.'
  }

  if (!inRange(form.oxygenSaturation, 1, 100)) {
    errors.oxygenSaturation =
      'Valeur attendue entre 1 et 100 %.'
  }

  if (form.weightKg !== '' && !inRange(form.weightKg, 0, 500)) {
    errors.weightKg = 'Poids invalide.'
  }

  if (form.heightCm !== '' && !inRange(form.heightCm, 0, 260)) {
    errors.heightCm = 'Taille invalide.'
  }

  if (
    form.glucoseMgDl !== '' &&
    !inRange(form.glucoseMgDl, 0, 1000)
  ) {
    errors.glucoseMgDl = 'Glycémie invalide.'
  }

  if (form.painScore !== '' && !inRange(form.painScore, 0, 10)) {
    errors.painScore =
      'Le score de douleur doit être compris entre 0 et 10.'
  }

  if (form.clinicalNotes.trim().length < 10) {
    errors.clinicalNotes =
      'Décrivez l’évolution clinique en au moins 10 caractères.'
  }

  return Object.values(errors).every((value) => !value)
}

function submit() {
  if (!validate()) return

  emit('submit', buildTriageReevaluationPayload(form))
}
</script>

<template>
  <BaseCard
    title="Nouvelle réévaluation clinique"
    subtitle="Saisissez de nouvelles mesures. Les anciennes valeurs restent conservées dans l’historique."
  >
    <form class="space-y-5" @submit.prevent="submit">
      <BaseSelect
        v-model="form.newPriority"
        label="Priorité après réévaluation"
        placeholder="Sélectionner la priorité clinique"
        :options="priorityOptions"
        required
        :error="errors.newPriority"
      />

      <div
        v-if="vitalEmergency"
        class="rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-sm text-rose-900"
      >
        <p class="font-bold">Urgence vitale</p>
        <p class="mt-1">
          La confirmation orientera immédiatement le patient vers le
          service Urgences. Aucun rendez-vous ne sera créé.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput
          v-model="form.temperatureCelsius"
          label="Température °C"
          type="number"
          required
          :error="errors.temperatureCelsius"
        />

        <BaseInput
          v-model="form.bloodPressureSystolic"
          label="Tension systolique"
          type="number"
          :error="errors.bloodPressureSystolic"
        />

        <BaseInput
          v-model="form.bloodPressureDiastolic"
          label="Tension diastolique"
          type="number"
          :error="errors.bloodPressureDiastolic"
        />

        <BaseInput
          v-model="form.heartRate"
          label="Fréquence cardiaque"
          type="number"
          required
          :error="errors.heartRate"
        />

        <BaseInput
          v-model="form.respiratoryRate"
          label="Fréquence respiratoire"
          type="number"
          required
          :error="errors.respiratoryRate"
        />

        <BaseInput
          v-model="form.oxygenSaturation"
          label="Saturation SpO₂ %"
          type="number"
          required
          :error="errors.oxygenSaturation"
        />
      </div>

      <details class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <summary class="cursor-pointer font-semibold text-slate-800">
          Mesures complémentaires
        </summary>

        <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BaseInput
            v-model="form.weightKg"
            label="Poids kg"
            type="number"
            :error="errors.weightKg"
          />
          <BaseInput
            v-model="form.heightCm"
            label="Taille cm"
            type="number"
            :error="errors.heightCm"
          />
          <BaseInput
            v-model="form.glucoseMgDl"
            label="Glycémie mg/dL"
            type="number"
            :error="errors.glucoseMgDl"
          />
          <BaseInput
            v-model="form.painScore"
            label="Douleur /10"
            type="number"
            :error="errors.painScore"
          />
        </div>
      </details>

      <BaseTextarea
        v-model="form.clinicalNotes"
        label="Évolution clinique observée"
        placeholder="Décrivez les changements, signes nouveaux et actions entreprises"
        :rows="4"
        required
        :error="errors.clinicalNotes"
      />

      <div class="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <BaseButton
          type="button"
          variant="secondary"
          @click="$emit('cancel')"
        >
          Annuler
        </BaseButton>

        <BaseButton
          type="submit"
          :variant="vitalEmergency ? 'emergency' : 'success'"
          :loading="loading"
        >
          {{
            vitalEmergency
              ? 'Activer l’urgence vitale'
              : 'Enregistrer la réévaluation'
          }}
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>
