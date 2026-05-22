<script setup>
import { computed, reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

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
    default: 'Créer triage',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  numero_patient: '',
  numero_fiche: '',
  nom: '',
  postnom: '',
  prenom: '',
  sexe: '',
  age: '',

  temperature: '',
  tension_arterielle: '',
  frequence_cardiaque: '',
  frequence_respiratoire: '',
  spO2: '',
  poids: '',
  taille: '',

  service_entree: '',
  type_passage: 'NEW',
  priorite: 'ROUTINE',
})

const errors = reactive({})

const sexeOptions = [
  { label: 'Masculin', value: 'M' },
  { label: 'Féminin', value: 'F' },
]

const serviceOptions = [
  { label: 'Médecine interne', value: 'MÉDECINE INTERNE' },
  { label: 'Pédiatrie', value: 'PÉDIATRIE' },
  { label: 'Gynéco-obstétrique', value: 'GYNÉCO-OBSTÉTRIQUE' },
  { label: 'Chirurgie', value: 'CHIRURGIE' },
  { label: 'Laboratoire', value: 'LABORATOIRE' },
  { label: 'Imagerie', value: 'IMAGERIE' },
]

const typePassageOptions = [
  { label: 'Nouveau', value: 'NEW' },
  { label: 'Contrôle', value: 'CONTROLE' },
  { label: 'Référence', value: 'REFERENCE' },
  { label: 'Urgence', value: 'URGENCE' },
]

const prioriteOptions = [
  { label: 'Routine', value: 'ROUTINE' },
  { label: 'Urgent', value: 'URGENT' },
]

const imc = computed(() => {
  const poids = Number(form.poids)
  const tailleCm = Number(form.taille)

  if (!poids || !tailleCm) return ''

  const tailleM = tailleCm / 100
  return Number((poids / (tailleM * tailleM)).toFixed(1))
})

function toApiTypePassage(value) {
  const map = {
    NOUVEAU: 'NEW',
    NEW: 'NEW',

    CONTROLE: 'CONTROLE',
    CONTRÔLE: 'CONTROLE',

    REFERENCE: 'REFERENCE',
    RÉFÉRENCE: 'REFERENCE',

    URGENCE: 'URGENCE',
  }

  return map[String(value || '').toUpperCase()] || 'NEW'
}

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    form.numero_patient = value.numero_patient || ''
    form.numero_fiche = value.numero_fiche || ''
    form.nom = value.nom || ''
    form.postnom = value.postnom || ''
    form.prenom = value.prenom || ''
    form.sexe = value.sexe || ''
    form.age = value.age || ''

    form.temperature = value.temperature || ''
    form.tension_arterielle = value.tension_arterielle || ''
    form.frequence_cardiaque = value.frequence_cardiaque || ''
    form.frequence_respiratoire = value.frequence_respiratoire || ''
    form.spO2 = value.spO2 || ''
    form.poids = value.poids || ''
    form.taille = value.taille || ''

    form.service_entree = value.service_entree || ''
    form.type_passage = toApiTypePassage(value.type_passage || 'NEW')
    form.priorite = value.priorite || 'ROUTINE'
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validate() {
  clearErrors()

  if (!form.numero_patient) errors.numero_patient = 'Numéro patient obligatoire.'
  if (!form.numero_fiche) errors.numero_fiche = 'Numéro fiche obligatoire.'
  if (!form.nom) errors.nom = 'Nom obligatoire.'
  if (!form.prenom) errors.prenom = 'Prénom obligatoire.'
  if (!form.sexe) errors.sexe = 'Sexe obligatoire.'
  if (!form.temperature) errors.temperature = 'Température obligatoire.'
  if (!form.tension_arterielle) errors.tension_arterielle = 'Tension artérielle obligatoire.'
  if (!form.frequence_cardiaque) errors.frequence_cardiaque = 'Fréquence cardiaque obligatoire.'
  if (!form.frequence_respiratoire)
    errors.frequence_respiratoire = 'Fréquence respiratoire obligatoire.'
  if (!form.spO2) errors.spO2 = 'spO2 obligatoire.'
  if (!form.service_entree) errors.service_entree = 'Service d’entrée obligatoire.'
  if (!form.type_passage) errors.type_passage = 'Type de passage obligatoire.'
  if (!form.priorite) errors.priorite = 'Priorité obligatoire.'

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    //numero_fiche: form.numero_fiche,

    signes_vitaux: {
      temperature: Number(form.temperature),
      tension_arterielle: form.tension_arterielle,
      frequence_cardiaque: Number(form.frequence_cardiaque),
      frequence_respiratoire: Number(form.frequence_respiratoire),
      spO2: Number(form.spO2),
      poids: Number(form.poids) || 0,
      taille: Number(form.taille) || 0,
      imc: Number(imc.value) || 0,
    },

    service_entree: form.service_entree,
    type_passage: toApiTypePassage(form.type_passage),
    priorite: form.priorite,
  }
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard title="Patient" subtitle="Informations d’identification du patient trié.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput
          v-model="form.numero_patient"
          label="Numéro patient"
          required
          :error="errors.numero_patient"
        />
        <BaseInput
          v-model="form.numero_fiche"
          label="Numéro fiche"
          required
          :error="errors.numero_fiche"
        />
        <BaseSelect
          v-model="form.sexe"
          label="Sexe"
          :options="sexeOptions"
          required
          :error="errors.sexe"
        />

        <BaseInput v-model="form.nom" label="Nom" required :error="errors.nom" />
        <BaseInput v-model="form.postnom" label="Postnom" />
        <BaseInput v-model="form.prenom" label="Prénom" required :error="errors.prenom" />
        <BaseInput v-model="form.age" label="Âge" type="number" />
      </div>
    </BaseCard>

    <BaseCard title="Signes vitaux" subtitle="Mesures cliniques relevées au triage.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BaseInput
          v-model="form.temperature"
          label="Température °C"
          type="number"
          required
          :error="errors.temperature"
        />
        <BaseInput
          v-model="form.tension_arterielle"
          label="Tension artérielle"
          placeholder="120/80"
          required
          :error="errors.tension_arterielle"
        />
        <BaseInput
          v-model="form.frequence_cardiaque"
          label="Fréquence cardiaque"
          type="number"
          required
          :error="errors.frequence_cardiaque"
        />
        <BaseInput
          v-model="form.frequence_respiratoire"
          label="Fréquence respiratoire"
          type="number"
          required
          :error="errors.frequence_respiratoire"
        />
        <BaseInput v-model="form.spO2" label="spO2 %" type="number" required :error="errors.spO2" />
        <BaseInput v-model="form.poids" label="Poids kg" type="number" />
        <BaseInput v-model="form.taille" label="Taille cm" type="number" />

        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">IMC calculé</p>
          <p class="mt-1 text-lg font-semibold text-slate-950">{{ imc || '—' }}</p>
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Orientation" subtitle="Priorité clinique et service d’entrée.">
      <div class="grid gap-4 md:grid-cols-3">
        <BaseSelect
          v-model="form.service_entree"
          label="Service d’entrée"
          :options="serviceOptions"
          required
          :error="errors.service_entree"
        />
        <BaseSelect
          v-model="form.type_passage"
          label="Type de passage"
          :options="typePassageOptions"
          required
          :error="errors.type_passage"
        />
        <BaseSelect
          v-model="form.priorite"
          label="Priorité"
          :options="prioriteOptions"
          required
          :error="errors.priorite"
        />
      </div>
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton
        type="submit"
        :variant="form.priorite === 'URGENT' ? 'emergency' : 'primary'"
        :loading="loading"
      >
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
