<script setup>
import {
  computed,
  reactive,
  ref,
  watch,
} from 'vue'

import {
  clinicalFormFromConsultation,
  clinicalFormSnapshot,
  createClinicalUpdatePayload,
  hasClinicalChanges,
} from '@/modules/consultations/policies/consultation-clinical-ui.policy'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

const props = defineProps({
  consultation: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  conflict: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'save',
  'reload',
  'dirty-change',
])

const form = reactive({
  illnessHistory: '',
  medicalHistory: '',
  clinicalExam: '',
  provisionalDiagnosis: '',
  treatmentPlan: '',
})

const initialSnapshot = ref({})
const localError = ref('')

function hydrate(consultation) {
  const values =
    clinicalFormFromConsultation(
      consultation,
    )

  Object.assign(form, values)

  initialSnapshot.value =
    clinicalFormSnapshot(values)

  localError.value = ''
}

watch(
  () => props.consultation,
  (consultation) => {
    if (consultation) {
      hydrate(consultation)
    }
  },
  {
    immediate: true,
    deep: false,
  },
)

const dirty = computed(() =>
  hasClinicalChanges(
    form,
    initialSnapshot.value,
  ),
)

watch(
  dirty,
  (value) => {
    emit('dirty-change', value)
  },
  {
    immediate: true,
  },
)

const saveDisabled = computed(
  () =>
    !props.editable ||
    props.saving ||
    !dirty.value ||
    props.conflict,
)

function submit() {
  localError.value = ''

  try {
    const payload =
      createClinicalUpdatePayload(
        form,
        props.consultation.updated_at,
        initialSnapshot.value,
      )

    emit('save', payload)
  } catch (error) {
    localError.value =
      error?.message ||
      'Données cliniques invalides.'
  }
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="submit"
  >
    <BaseCard
      title="Motif principal"
      subtitle="Information issue du triage. Elle n’est pas modifiable depuis la consultation."
    >
      <BaseTextarea
        :model-value="
          consultation.plaintes || ''
        "
        label="Motif principal"
        :rows="3"
        disabled
      />
    </BaseCard>

    <section
      class="grid gap-6 xl:grid-cols-2"
    >
      <BaseCard
        title="Histoire de la maladie"
        subtitle="Évolution des symptômes et éléments chronologiques utiles."
      >
        <BaseTextarea
          v-model="form.illnessHistory"
          label="Histoire de la maladie"
          placeholder="Début, évolution, facteurs aggravants ou soulageants..."
          :rows="7"
          :disabled="!editable || saving"
        />
      </BaseCard>

      <BaseCard
        title="Antécédents médicaux"
        subtitle="Antécédents personnels pertinents pour la prise en charge."
      >
        <BaseTextarea
          v-model="form.medicalHistory"
          label="Antécédents médicaux"
          placeholder="Pathologies, interventions, allergies connues, traitements antérieurs pertinents..."
          :rows="7"
          :disabled="!editable || saving"
        />
      </BaseCard>

      <BaseCard
        title="Examen clinique"
        subtitle="Constat clinique du médecin lors de la consultation."
      >
        <BaseTextarea
          v-model="form.clinicalExam"
          label="Examen clinique"
          placeholder="État général, examen par appareil, signes cliniques..."
          :rows="9"
          :disabled="!editable || saving"
        />
      </BaseCard>

      <BaseCard
        title="Diagnostic provisoire"
        subtitle="Hypothèse clinique avant confirmation éventuelle par examens complémentaires."
      >
        <BaseInput
          v-model="form.provisionalDiagnosis"
          label="Diagnostic provisoire"
          placeholder="Ex. syndrome infectieux, suspicion de paludisme..."
          :disabled="!editable || saving"
        />

        <p
          class="mt-3 text-xs text-slate-500"
        >
          Ce champ n’est pas le diagnostic final et
          ne clôture pas la consultation.
        </p>
      </BaseCard>
    </section>

    <BaseCard
      title="Plan de prise en charge"
      subtitle="Conduite clinique prévue à ce stade, sans déclencher automatiquement un acte définitif."
    >
      <BaseTextarea
        v-model="form.treatmentPlan"
        label="Plan de prise en charge"
        placeholder="Surveillance, mesures cliniques, orientation envisagée..."
        :rows="7"
        :disabled="!editable || saving"
      />
    </BaseCard>

    <div
      v-if="localError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      role="alert"
    >
      {{ localError }}
    </div>

    <div
      v-if="conflict"
      class="rounded-2xl border border-amber-200 bg-amber-50 p-4"
      role="alert"
    >
      <p
        class="text-sm font-semibold text-amber-900"
      >
        Le dossier a changé depuis son chargement.
      </p>
      <p
        class="mt-1 text-sm text-amber-800"
      >
        Aucun écrasement n’a été effectué. Rechargez
        les données du serveur avant une nouvelle
        saisie.
      </p>

      <BaseButton
        type="button"
        variant="secondary"
        class="mt-3"
        :disabled="saving"
        @click="emit('reload')"
      >
        Actualiser le dossier
      </BaseButton>
    </div>

    <div
      class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-slate-500">
        <template v-if="!editable">
          Consultation en lecture seule pour votre profil.
        </template>
        <template v-else-if="dirty">
          Modifications non enregistrées.
        </template>
        <template v-else>
          Toutes les informations affichées sont enregistrées.
        </template>
      </p>

      <BaseButton
        v-if="editable"
        type="submit"
        :loading="saving"
        loading-text="Enregistrement..."
        :disabled="saveDisabled"
      >
        Enregistrer les informations cliniques
      </BaseButton>
    </div>
  </form>
</template>
