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
    default: 'Créer paiement',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  numero_patient: '',
  numero_fiche: '',
  nom: '',
  postnom: '',
  prenom: '',

  service: '',
  motif: '',
  montant: '',
  devise: 'CDF',
  mode_paiement: 'CASH',
  reference: '',
  statut: 'pending',
  date_paiement: new Date().toISOString().split('T')[0],
  notes: '',
})

const errors = reactive({})

const serviceOptions = [
  { label: 'Réception', value: 'Réception' },
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Laboratoire', value: 'Laboratoire' },
  { label: 'Imagerie', value: 'Imagerie' },
  { label: 'Pharmacie', value: 'Pharmacie' },
  { label: 'Hospitalisation', value: 'Hospitalisation' },
]

const modeOptions = [
  { label: 'Espèces', value: 'CASH' },
  { label: 'Mobile Money', value: 'MM' },
  { label: 'Carte bancaire', value: 'CARD' },
  { label: 'Virement', value: 'VIREMENT' },
  { label: 'Chèque', value: 'CHEQUE' },
]

const statutOptions = [
  { label: 'En attente', value: 'pending' },
  { label: 'Payé', value: 'paid' },
  { label: 'Annulé', value: 'cancelled' },
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

    form.service = value.service || ''
    form.motif = value.motif || ''
    form.montant = value.montant || ''
    form.devise = value.devise || 'CDF'
    form.mode_paiement = value.mode_paiement || 'CASH'
    form.reference = value.reference || ''
    form.statut = value.statut || 'pending'
    form.date_paiement = value.date_paiement || new Date().toISOString().split('T')[0]
    form.notes = value.raw?.notes || value.raw?.description || ''
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
  if (!form.service) errors.service = 'Service obligatoire.'
  if (!form.motif) errors.motif = 'Motif obligatoire.'
  if (!form.montant) errors.montant = 'Montant obligatoire.'
  if (Number(form.montant) <= 0) errors.montant = 'Le montant doit être supérieur à zéro.'
  if (!form.mode_paiement) errors.mode_paiement = 'Mode de paiement obligatoire.'

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    identification_patient: {
      numero_patient: form.numero_patient,
      nom: form.nom,
      postnom: form.postnom || '',
      prenom: form.prenom || '',
    },

    numero_patient: form.numero_patient,
    numero_fiche: form.numero_fiche,

    service: form.service,
    motif: form.motif,
    montant: Number(form.montant),
    devise: form.devise || 'CDF',
    mode_paiement: form.mode_paiement,
    reference: form.reference || undefined,

    statut: form.statut,
    status: form.statut,
    paye: form.statut === 'paid',
    paid: form.statut === 'paid',

    date_paiement: form.date_paiement || undefined,
    notes: form.notes || undefined,
  }
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard title="Patient" subtitle="Identification du patient concerné par le paiement.">
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
        <BaseInput v-model="form.nom" label="Nom" required :error="errors.nom" />
        <BaseInput v-model="form.postnom" label="Postnom" />
        <BaseInput v-model="form.prenom" label="Prénom" />
      </div>
    </BaseCard>

    <BaseCard title="Paiement" subtitle="Montant, service, mode de paiement et référence.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseSelect
          v-model="form.service"
          label="Service"
          :options="serviceOptions"
          required
          :error="errors.service"
        />

        <BaseInput
          v-model="form.motif"
          label="Motif"
          placeholder="Consultation, examens, médicaments..."
          required
          :error="errors.motif"
        />

        <BaseInput
          v-model="form.montant"
          label="Montant"
          type="number"
          required
          :error="errors.montant"
        />

        <BaseInput v-model="form.devise" label="Devise" placeholder="CDF" />

        <BaseSelect
          v-model="form.mode_paiement"
          label="Mode de paiement"
          :options="modeOptions"
          required
          :error="errors.mode_paiement"
        />

        <BaseInput
          v-model="form.reference"
          label="Référence"
          placeholder="Reçu, transaction, facture..."
        />

        <BaseInput v-model="form.date_paiement" label="Date paiement" type="date" />

        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea v-model="form.notes" label="Notes" placeholder="Observation caisse..." />
        </div>
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
