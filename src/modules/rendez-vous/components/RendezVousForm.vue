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
  submitLabel: {
    type: String,
    default: 'Créer rendez-vous',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  numero_patient: '',
  numero_fiche: '',
  nom: '',
  postnom: '',
  prenom: '',
  telephone: '',
  service: 'Consultation',
  medecin: '',
  motif: '',
  date_rdv: new Date().toISOString().split('T')[0],
  heure_rdv: '09:00',
  statut: 'scheduled',
  notes: '',
})

const errors = reactive({})

const serviceOptions = [
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Triage', value: 'Triage' },
  { label: 'Laboratoire', value: 'Laboratoire' },
  { label: 'Imagerie', value: 'Imagerie' },
  { label: 'Pharmacie', value: 'Pharmacie' },
  { label: 'Administration', value: 'Administration' },
]

const statutOptions = [
  { label: 'Programmé', value: 'scheduled' },
  { label: 'Confirmé', value: 'confirmed' },
  { label: 'Terminé', value: 'completed' },
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
    form.telephone = value.telephone || ''
    form.service = value.service || 'Consultation'
    form.medecin = value.medecin || ''
    form.motif = value.motif || ''
    form.date_rdv = value.date_rdv || new Date().toISOString().split('T')[0]
    form.heure_rdv = value.heure_rdv || '09:00'
    form.statut = value.statut || 'scheduled'
    form.notes = value.notes || ''
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
  if (!form.telephone) errors.telephone = 'Téléphone obligatoire.'
  if (!form.service) errors.service = 'Service obligatoire.'
  if (!form.motif) errors.motif = 'Motif obligatoire.'
  if (!form.date_rdv) errors.date_rdv = 'Date obligatoire.'
  if (!form.heure_rdv) errors.heure_rdv = 'Heure obligatoire.'

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    numero_patient: form.numero_patient,
    numero_fiche: form.numero_fiche,
    nom: form.nom,
    postnom: form.postnom || '',
    prenom: form.prenom,
    telephone: form.telephone,
    service: form.service,
    medecin: form.medecin || '',
    motif: form.motif,
    date_rdv: form.date_rdv,
    heure_rdv: form.heure_rdv,
    statut: form.statut,
    notes: form.notes || '',
  }
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard title="Patient" subtitle="Identification du patient concerné par le rendez-vous.">
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
        <BaseInput v-model="form.prenom" label="Prénom" required :error="errors.prenom" />
        <BaseInput v-model="form.telephone" label="Téléphone" required :error="errors.telephone" />
      </div>
    </BaseCard>

    <BaseCard
      title="Planification"
      subtitle="Service, motif, date, heure et statut du rendez-vous."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseSelect
          v-model="form.service"
          label="Service"
          :options="serviceOptions"
          required
          :error="errors.service"
        />
        <BaseInput v-model="form.medecin" label="Médecin / agent" placeholder="Médecin de garde" />
        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />

        <BaseInput
          v-model="form.date_rdv"
          label="Date rendez-vous"
          type="date"
          required
          :error="errors.date_rdv"
        />
        <BaseInput
          v-model="form.heure_rdv"
          label="Heure rendez-vous"
          type="time"
          required
          :error="errors.heure_rdv"
        />
        <BaseInput v-model="form.motif" label="Motif" required :error="errors.motif" />

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea
            v-model="form.notes"
            label="Notes"
            placeholder="Instructions, observation, préparation..."
            :rows="4"
          />
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
