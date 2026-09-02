<script setup>
import { computed, reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

import {
  TRIAGE_ORIENTATION_OPTIONS,
  TRIAGE_PRIORITY_OPTIONS,
  TRIAGE_TYPE_OPTIONS,
  buildTriageCreatePayload,
  findVitalEmergencyService,
  isEmergencyTriagePriority,
  isVitalTriagePriority,
  triagePatientFullName,
} from '@/modules/triage/workflow/triage-create.workflow'

const props = defineProps({
  queueItem: { type: Object, required: true },
  services: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  motifInitial: '',
  typePassage: '',
  priority: '',

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

  firstAidPerformed: false,
  firstAidNotes: '',

  requestedServiceId: '',
  orientationTargetModule: '',
  appointmentDateTime: '',
  vitalEmergencyConfirmed: false,
})

const errors = reactive({})
const patientName = computed(() => triagePatientFullName(props.queueItem))
const serviceOptions = computed(() =>
  props.services.map((service) => ({
    label: service.label || service.name,
    value: String(service.value || service.id),
  })),
)
const emergency = computed(() => isEmergencyTriagePriority(form.priority))
const vitalEmergency = computed(() =>
  isVitalTriagePriority(form.priority),
)
const vitalEmergencyService = computed(() =>
  findVitalEmergencyService(props.services),
)
const vitalEmergencyConfigured = computed(
  () => Boolean(vitalEmergencyService.value),
)

watch(
  [() => form.priority, () => props.services],
  () => {
    if (!vitalEmergency.value) return

    form.typePassage = 'URGENCE'
    form.orientationTargetModule = 'CONSULTATION'
    form.appointmentDateTime = ''

    if (vitalEmergencyService.value) {
      form.requestedServiceId = String(
        vitalEmergencyService.value.id ||
          vitalEmergencyService.value.value,
      )
    }
  },
  { deep: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function inRange(value, min, max) {
  const number = Number(value)
  return Number.isFinite(number) && number >= min && number <= max
}

function validate() {
  clearErrors()

  if (form.motifInitial.trim().length < 3) {
    errors.motifInitial = 'Le motif initial doit contenir au moins 3 caractères.'
  }
  if (!form.typePassage) errors.typePassage = 'Choisissez le type de passage.'
  if (!form.priority) errors.priority = 'Choisissez la priorité clinique.'

  if (!inRange(form.temperatureCelsius, 25, 45)) {
    errors.temperatureCelsius = 'Valeur attendue entre 25 et 45 °C.'
  }
  if (form.bloodPressureSystolic !== '' && !inRange(form.bloodPressureSystolic, 40, 300)) {
    errors.bloodPressureSystolic = 'Valeur attendue entre 40 et 300.'
  }
  if (form.bloodPressureDiastolic !== '' && !inRange(form.bloodPressureDiastolic, 20, 200)) {
    errors.bloodPressureDiastolic = 'Valeur attendue entre 20 et 200.'
  }
  if (!inRange(form.heartRate, 20, 250)) {
    errors.heartRate = 'Valeur attendue entre 20 et 250 battements/min.'
  }
  if (!inRange(form.respiratoryRate, 5, 80)) {
    errors.respiratoryRate = 'Valeur attendue entre 5 et 80 respirations/min.'
  }
  if (!inRange(form.oxygenSaturation, 1, 100)) {
    errors.oxygenSaturation = 'Valeur attendue entre 1 et 100 %.'
  }
  if (form.weightKg !== '' && !inRange(form.weightKg, 0, 500)) errors.weightKg = 'Poids invalide.'
  if (form.heightCm !== '' && !inRange(form.heightCm, 0, 260)) errors.heightCm = 'Taille invalide.'
  if (form.glucoseMgDl !== '' && !inRange(form.glucoseMgDl, 0, 1000)) errors.glucoseMgDl = 'Glycémie invalide.'
  if (form.painScore !== '' && !inRange(form.painScore, 0, 10)) {
    errors.painScore = 'Le score de douleur doit être compris entre 0 et 10.'
  }
  if (form.firstAidPerformed && form.firstAidNotes.trim().length < 2) {
    errors.firstAidNotes = 'Décrivez les premiers soins réalisés.'
  }
  if (!form.requestedServiceId) {
    errors.requestedServiceId = 'Choisissez un service clinique.'
  }
  if (!form.orientationTargetModule) {
    errors.orientationTargetModule = 'Choisissez la destination du patient.'
  }
  if (form.orientationTargetModule === 'RDV_CONSULTATION' && !form.appointmentDateTime) {
    errors.appointmentDateTime = 'La date du rendez-vous est obligatoire.'
  }

  if (vitalEmergency.value && !vitalEmergencyConfigured.value) {
    errors.requestedServiceId =
      'Le service Urgences doit être actif et autorisé au triage.'
  }

  return Object.values(errors).every((value) => !value)
}

function submit() {
  if (!validate()) return
  emit('submit', buildTriageCreatePayload(form, props.queueItem))
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard
      title="Contexte patient"
      subtitle="Identité issue de la Réception. Elle n’est pas modifiable au Triage."
    >
      <dl class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl bg-slate-50 p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Patient</dt>
          <dd class="mt-1 font-semibold text-slate-950">{{ patientName || 'Patient' }}</dd>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Identifiant</dt>
          <dd class="mt-1 font-semibold text-slate-950">{{ queueItem.patient.patientCode }}</dd>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Épisode</dt>
          <dd class="mt-1 font-semibold text-slate-950">{{ queueItem.episode.episodeCode }}</dd>
        </div>
        <div class="rounded-xl bg-slate-50 p-4">
          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Réception</dt>
          <dd class="mt-1 font-semibold text-slate-950">{{ queueItem.reception.receptionCode }}</dd>
        </div>
      </dl>
    </BaseCard>

    <BaseCard title="Évaluation initiale" subtitle="Chaque choix doit refléter l’évaluation réellement effectuée.">
      <div class="grid gap-4 lg:grid-cols-2">
        <BaseTextarea
          v-model="form.motifInitial"
          class="lg:col-span-2"
          label="Motif initial"
          placeholder="Décrivez les symptômes, leur durée et la raison de la venue"
          :rows="3"
          required
          :error="errors.motifInitial"
        />

        <div>
          <BaseSelect
            v-model="form.typePassage"
            label="Type de passage"
            placeholder="Sélectionner le type de passage"
            :options="TRIAGE_TYPE_OPTIONS"
            required
            :disabled="vitalEmergency"
            :error="errors.typePassage"
          />
          <p class="mt-2 text-xs leading-5 text-slate-500">Indique comment le patient est arrivé dans le parcours de soins.</p>
        </div>

        <div>
          <BaseSelect
            v-model="form.priority"
            label="Priorité clinique"
            placeholder="Sélectionner la priorité clinique"
            :options="TRIAGE_PRIORITY_OPTIONS"
            required
            :error="errors.priority"
          />
          <p class="mt-2 text-xs leading-5 text-slate-500">Choisissez selon l’état actuel du patient, jamais selon l’ordre d’arrivée.</p>
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Constantes vitales" subtitle="Mesures relevées au moment du triage.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput v-model="form.temperatureCelsius" label="Température °C" type="number" required :error="errors.temperatureCelsius" />
        <BaseInput v-model="form.bloodPressureSystolic" label="Tension systolique" type="number" :error="errors.bloodPressureSystolic" />
        <BaseInput v-model="form.bloodPressureDiastolic" label="Tension diastolique" type="number" :error="errors.bloodPressureDiastolic" />
        <div>
          <BaseInput v-model="form.heartRate" label="Fréquence cardiaque" type="number" required :error="errors.heartRate" />
          <p class="mt-2 text-xs text-slate-500">Nombre de battements observés pendant une minute.</p>
        </div>
        <div>
          <BaseInput v-model="form.respiratoryRate" label="Fréquence respiratoire" type="number" required :error="errors.respiratoryRate" />
          <p class="mt-2 text-xs text-slate-500">Nombre de respirations observées pendant une minute.</p>
        </div>
        <div>
          <BaseInput v-model="form.oxygenSaturation" label="Saturation SpO₂ %" type="number" required :error="errors.oxygenSaturation" />
          <p class="mt-2 text-xs text-slate-500">Pourcentage d’oxygène mesuré avec l’oxymètre.</p>
        </div>
      </div>

      <details class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <summary class="cursor-pointer font-semibold text-slate-800">Mesures complémentaires</summary>
        <p class="mt-2 text-sm text-slate-500">À renseigner lorsqu’elles sont disponibles ou cliniquement utiles.</p>
        <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BaseInput v-model="form.weightKg" label="Poids kg" type="number" :error="errors.weightKg" />
          <BaseInput v-model="form.heightCm" label="Taille cm" type="number" :error="errors.heightCm" />
          <BaseInput v-model="form.glucoseMgDl" label="Glycémie mg/dL" type="number" :error="errors.glucoseMgDl" />
          <BaseInput v-model="form.painScore" label="Douleur /10" type="number" :error="errors.painScore" />
        </div>
      </details>
    </BaseCard>

    <BaseCard title="Premiers soins" subtitle="Toute intervention réalisée avant l’orientation doit être documentée.">
      <label class="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
        <input v-model="form.firstAidPerformed" type="checkbox" class="mt-1 h-4 w-4 rounded border-slate-300" />
        <span>
          <span class="block font-semibold text-slate-900">Premiers soins réalisés</span>
          <span class="mt-1 block text-sm text-slate-500">Activez uniquement lorsqu’une intervention a réellement été effectuée.</span>
        </span>
      </label>
      <BaseTextarea
        v-if="form.firstAidPerformed"
        v-model="form.firstAidNotes"
        class="mt-4"
        label="Description des premiers soins"
        placeholder="Décrivez les gestes, produits ou dispositifs utilisés"
        :rows="3"
        required
        :error="errors.firstAidNotes"
      />
    </BaseCard>

    <BaseCard title="Orientation" subtitle="Le backend n’accepte que les services cliniques autorisés.">
      <div v-if="services.length === 0" class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Aucun service clinique n’est actuellement autorisé à recevoir un patient depuis le triage. Contactez l’administrateur.
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <BaseSelect
            v-model="form.requestedServiceId"
            label="Service clinique demandé"
            placeholder="Sélectionner un service clinique"
            :options="serviceOptions"
            required
            :disabled="services.length === 0 || vitalEmergency"
            :error="errors.requestedServiceId"
          />
          <p class="mt-2 text-xs text-slate-500">Les services administratifs, financiers et techniques ne sont pas proposés.</p>
        </div>

        <div>
          <BaseSelect
            v-model="form.orientationTargetModule"
            label="Destination"
            placeholder="Sélectionner la destination"
            :options="TRIAGE_ORIENTATION_OPTIONS"
            required
            :disabled="vitalEmergency"
            :error="errors.orientationTargetModule"
          />
          <p class="mt-2 text-xs text-slate-500">Choisissez une consultation immédiate ou un rendez-vous programmé.</p>
        </div>

        <BaseInput
          v-if="form.orientationTargetModule === 'RDV_CONSULTATION'"
          v-model="form.appointmentDateTime"
          class="md:col-span-2"
          label="Date et heure du rendez-vous"
          type="datetime-local"
          required
          :error="errors.appointmentDateTime"
        />
      </div>
    </BaseCard>

    <div
      v-if="vitalEmergency"
      class="rounded-2xl border-2 border-rose-500 bg-rose-50 p-5 text-rose-900"
    >
      <p class="font-bold">Urgence vitale — prise en charge immédiate</p>
      <p class="mt-1 text-sm">
        Le type de passage, le service Urgences et la consultation
        immédiate sont imposés. La confirmation sera rapide et auditée.
      </p>
      <p
        v-if="!vitalEmergencyConfigured"
        class="mt-3 text-sm font-semibold"
      >
        Le service Urgences n’est pas correctement configuré.
      </p>
    </div>

    <div
      v-else-if="emergency"
      class="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-medium text-rose-800"
    >
      Priorité urgente sélectionnée. Vérifiez immédiatement les constantes et l’orientation.
    </div>

    <div class="flex flex-col-reverse justify-end gap-3 sm:flex-row">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')">Retour à la file</BaseButton>
      <BaseButton
        type="submit"
        :variant="emergency ? 'emergency' : 'success'"
        :loading="loading"
        :disabled="
          services.length === 0 ||
          (vitalEmergency && !vitalEmergencyConfigured)
        "
      >
        {{
          vitalEmergency
            ? 'Activer l’urgence vitale'
            : 'Valider le triage'
        }}
      </BaseButton>
    </div>
  </form>
</template>
