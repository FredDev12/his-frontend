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
    default: 'Créer réception',
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
  date_naissance: '',
  age: '',
  telephone: '',
  adresse: '',
  service: '',
  motif: '',
  urgence: false,
  montant_fiche: 0,
  paiement_effectue: false,
  mode_paiement: 'CASH',
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
  { label: 'Laboratoire', value: 'LABORATOIRE' },
  { label: 'Imagerie', value: 'IMAGERIE' },
  { label: 'Pharmacie', value: 'PHARMACIE' },
]

const paiementOptions = [
  { label: 'Espèces', value: 'CASH' },
  { label: 'Mobile Money', value: 'MM' },
  { label: 'Carte bancaire', value: 'CARD' },
  { label: 'Chèque', value: 'CHEQUE' },
  { label: 'Virement', value: 'VIREMENT' },
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
    form.date_naissance =
      value.raw?.identification_patient?.date_naissance ||
      value.raw?.identificationPatient?.date_naissance ||
      value.raw?.date_naissance ||
      ''
    form.age = value.age || ''
    form.telephone = value.telephone || ''
    form.adresse = value.adresse || ''
    form.service = value.service || ''
    form.motif = value.motif || ''
    form.urgence = Boolean(value.urgence)
    form.montant_fiche = value.montant || 0
    form.paiement_effectue = Boolean(value.paiement_effectue)
    form.mode_paiement = value.mode_paiement || 'CASH'
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

  if (!form.numero_patient) errors.numero_patient = 'Numéro patient obligatoire.'
  if (!form.numero_fiche) errors.numero_fiche = 'Numéro fiche obligatoire.'
  if (!form.nom) errors.nom = 'Nom obligatoire.'
  if (!form.prenom) errors.prenom = 'Prénom obligatoire.'
  if (!form.sexe) errors.sexe = 'Sexe obligatoire.'
  if (!form.date_naissance) errors.date_naissance = 'Date de naissance obligatoire.'
  if (!form.age) errors.age = 'Âge obligatoire.'
  if (!form.telephone) errors.telephone = 'Téléphone obligatoire.'
  if (!form.service) errors.service = 'Service obligatoire.'
  if (!form.motif) errors.motif = 'Motif obligatoire.'

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  const now = new Date().toISOString()
  const today = new Date().toISOString().split('T')[0]

  return {
    identification_patient: {
      numero_patient: form.numero_patient,
      nom: form.nom,
      postnom: form.postnom || '',
      prenom: form.prenom,
      sexe: form.sexe,
      date_naissance: form.date_naissance,
      age: Number(form.age) || 0,
      telephone: form.telephone,
      adresse: form.adresse || 'Non spécifiée',
      personne_contacter: 'Non spécifié',
      telephone_urgence: form.telephone,
      etat_civil: 'Célibataire',
      contact_urgence: {
        nom: 'Non spécifié',
        lien: 'Famille',
        telephone: form.telephone,
      },
    },

    paiement_fiche: {
      montant_fiche: Number(form.montant_fiche) || 0,
      paiement_effectue: Boolean(form.paiement_effectue),
      mode_paiement: form.mode_paiement || 'CASH',
      facture_numero: 'N/A',
      recu_numero: 'N/A',
      date_paiement: today,
    },

    service: form.service,
    service_entree: form.service,
    motif: form.motif,
    urgence: Boolean(form.urgence),

    created_at: props.initialValue?.raw?.created_at || now,
    numero_fiche: form.numero_fiche,
    type_relation: 'SELF',
    status: form.statut || 'active',
    statut: form.statut || 'active',
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
      title="Patient"
      subtitle="Informations principales utilisées pour ouvrir la réception."
    >
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

        <BaseInput
          v-model="form.date_naissance"
          label="Date de naissance"
          type="date"
          required
          :error="errors.date_naissance"
        />
        <BaseInput v-model="form.age" label="Âge" type="number" required :error="errors.age" />
        <BaseInput v-model="form.telephone" label="Téléphone" required :error="errors.telephone" />

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea v-model="form.adresse" label="Adresse" />
        </div>
      </div>
    </BaseCard>

    <BaseCard title="Admission" subtitle="Service d’orientation, motif et priorité.">
      <div class="grid gap-4 md:grid-cols-2">
        <BaseSelect
          v-model="form.service"
          label="Service d’entrée"
          :options="serviceOptions"
          required
          :error="errors.service"
        />

        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.urgence"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-red-700 focus:ring-red-700"
          />
          <span class="text-sm font-medium text-slate-700"> Marquer comme urgence </span>
        </label>

        <div class="md:col-span-2">
          <BaseTextarea
            v-model="form.motif"
            label="Motif de venue"
            required
            :error="errors.motif"
          />
        </div>
      </div>
    </BaseCard>

    <BaseCard
      title="Paiement de la fiche"
      subtitle="Paiement initial lié à l’ouverture de l’admission."
    >
      <div class="grid gap-4 md:grid-cols-3">
        <BaseInput v-model="form.montant_fiche" label="Montant fiche" type="number" />

        <BaseSelect
          v-model="form.mode_paiement"
          label="Mode de paiement"
          :options="paiementOptions"
        />

        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <input
            v-model="form.paiement_effectue"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm font-medium text-slate-700"> Paiement effectué </span>
        </label>
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
