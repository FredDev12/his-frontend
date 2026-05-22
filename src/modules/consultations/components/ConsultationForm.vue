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
    default: 'Créer consultation',
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

  reception_id: '',
  triage_id: '',
  service: 'MÉDECINE INTERNE',

  plaintes: '',
  histoire: '',
  antecedents: '',
  deroulement: '',
  etat_general: '',
  anamnese: '',
  examen_clinique: '',
  diagnostique: '',
  plan_prise_en_charge: '',
  statut: 'active',
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
]

const statutOptions = [
  { label: 'En cours', value: 'active' },
  { label: 'Terminée', value: 'completed' },
  { label: 'Annulée', value: 'cancelled' },
]

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

    form.reception_id = value.reception_id || ''
    form.triage_id = value.triage_id || ''
    form.service = value.service || 'MÉDECINE INTERNE'

    form.plaintes = value.plaintes || ''
    form.histoire = value.histoire || ''
    form.antecedents = value.antecedents || ''
    form.deroulement = value.deroulement || ''
    form.etat_general = value.etat_general || ''
    form.anamnese = value.anamnese || ''
    form.examen_clinique = value.examen_clinique || ''
    form.diagnostique = value.diagnostique || ''
    form.plan_prise_en_charge = value.plan_prise_en_charge || ''
    form.statut = value.statut || 'active'
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

  //if (!form.numero_patient) errors.numero_patient = 'Numéro patient obligatoire.'
  ///if (!form.numero_fiche) errors.numero_fiche = 'Numéro fiche obligatoire.'
  //if (!form.nom) errors.nom = 'Nom obligatoire.'
  //if (!form.prenom) errors.prenom = 'Prénom obligatoire.'
  //if (!form.sexe) errors.sexe = 'Sexe obligatoire.'
  //if (!form.plaintes) errors.plaintes = 'Plaintes obligatoires.'
  //if (!form.etat_general) errors.etat_general = 'État général obligatoire.'
  //if (!form.anamnese) errors.anamnese = 'Anamnèse obligatoire.'
  //if (!form.examen_clinique) errors.examen_clinique = 'Examen clinique obligatoire.'
  //if (!form.diagnostique) errors.diagnostique = 'Diagnostic obligatoire.'
  //if (!form.plan_prise_en_charge)
  //  errors.plan_prise_en_charge = 'Plan de prise en charge obligatoire.'

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    //numero_fiche: form.numero_fiche,
    //reception_id: form.reception_id || null,
    //triage_id: form.triage_id || null,
    //service: form.service,
    //status: form.statut,

    pgad: {
      plaintes: form.plaintes,
      histoire: form.histoire || 'Non renseigné',
      antecedents: form.antecedents || 'Non renseigné',
      deroulement: form.deroulement || 'Non renseigné',
    },

    etat_general: {
      resume: form.etat_general,
    },

    anamnese: {
      resume: form.anamnese,
    },

    examen_clinique: {
      resume: form.examen_clinique,
    },

    diagnostic: {
      resume: form.diagnostique,
    },

    plan_prise_en_charge: {
      resume: form.plan_prise_en_charge,
    },
  }
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard title="Patient" subtitle="Identification du patient consulté.">
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

        <BaseInput v-model="form.reception_id" label="ID réception" />
        <BaseInput v-model="form.triage_id" label="ID triage" />
        <BaseSelect v-model="form.service" label="Service" :options="serviceOptions" />
      </div>
    </BaseCard>

    <BaseCard title="PGAD" subtitle="Plaintes, histoire, antécédents et déroulement.">
      <div class="grid gap-4 md:grid-cols-2">
        <BaseTextarea v-model="form.plaintes" label="Plaintes" required :error="errors.plaintes" />
        <BaseTextarea v-model="form.histoire" label="Histoire de la maladie" />
        <BaseTextarea v-model="form.antecedents" label="Antécédents" />
        <BaseTextarea v-model="form.deroulement" label="Déroulement" />
      </div>
    </BaseCard>

    <BaseCard title="Examen médical" subtitle="État général, anamnèse et examen clinique.">
      <div class="grid gap-4 md:grid-cols-2">
        <BaseTextarea
          v-model="form.etat_general"
          label="État général"
          required
          :error="errors.etat_general"
        />
        <BaseTextarea v-model="form.anamnese" label="Anamnèse" required :error="errors.anamnese" />
        <div class="md:col-span-2">
          <BaseTextarea
            v-model="form.examen_clinique"
            label="Examen clinique"
            required
            :error="errors.examen_clinique"
            :rows="5"
          />
        </div>
      </div>
    </BaseCard>

    <BaseCard
      title="Diagnostic et prise en charge"
      subtitle="Diagnostic médical et conduite à tenir."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <BaseTextarea
          v-model="form.diagnostique"
          label="Diagnostic"
          required
          :error="errors.diagnostique"
          :rows="4"
        />

        <BaseTextarea
          v-model="form.plan_prise_en_charge"
          label="Plan de prise en charge"
          required
          :error="errors.plan_prise_en_charge"
          :rows="4"
        />

        <BaseSelect v-model="form.statut" label="Statut consultation" :options="statutOptions" />
      </div>
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton type="submit" :loading="loading">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
