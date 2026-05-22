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
    default: 'Créer sortie',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  numero_patient: '',
  numero_fiche: '',
  nom: '',
  postnom: '',
  prenom: '',

  type_sortie: 'SIMPLE',
  motif_sortie: '',
  destination: '',
  resume_medical: '',
  consignes: '',
  date_sortie: new Date().toISOString().split('T')[0],
  statut: 'pending',
})

const errors = reactive({})

const typeSortieOptions = [
  { label: 'Sortie simple', value: 'SIMPLE' },
  { label: 'Transfert', value: 'TRANSFERT' },
  { label: 'Sortie contre avis médical', value: 'CONTRE_AVIS' },
  { label: 'Évasion', value: 'EVASION' },
  { label: 'Décès', value: 'DECES' },
]

const statutOptions = [
  { label: 'En attente', value: 'pending' },
  { label: 'Sortie validée', value: 'validated' },
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

    form.type_sortie = value.type_sortie || 'SIMPLE'
    form.motif_sortie = value.motif_sortie || ''
    form.destination = value.destination || ''
    form.resume_medical = value.resume_medical || ''
    form.consignes = value.consignes || ''
    form.date_sortie = value.date_sortie || new Date().toISOString().split('T')[0]
    form.statut = value.statut || 'pending'
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
  if (!form.type_sortie) errors.type_sortie = 'Type de sortie obligatoire.'
  if (!form.motif_sortie) errors.motif_sortie = 'Motif de sortie obligatoire.'
  if (!form.resume_medical) errors.resume_medical = 'Résumé médical obligatoire.'
  if (!form.consignes) errors.consignes = 'Consignes de sortie obligatoires.'

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

    type_sortie: form.type_sortie,
    motif_sortie: form.motif_sortie,
    destination: form.destination || undefined,
    resume_medical: form.resume_medical,
    consignes: form.consignes,
    date_sortie: form.date_sortie || undefined,

    statut: form.statut,
    status: form.statut,
  }
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard title="Patient" subtitle="Identification du patient concerné par la sortie.">
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

    <BaseCard title="Sortie patient" subtitle="Motif, type de sortie, destination et consignes.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseSelect
          v-model="form.type_sortie"
          label="Type de sortie"
          :options="typeSortieOptions"
          required
          :error="errors.type_sortie"
        />

        <BaseInput
          v-model="form.motif_sortie"
          label="Motif de sortie"
          required
          :error="errors.motif_sortie"
        />

        <BaseInput
          v-model="form.destination"
          label="Destination"
          placeholder="Domicile, hôpital référé..."
        />

        <BaseInput v-model="form.date_sortie" label="Date de sortie" type="date" />

        <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea
            v-model="form.resume_medical"
            label="Résumé médical"
            required
            :error="errors.resume_medical"
            :rows="4"
          />
        </div>

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea
            v-model="form.consignes"
            label="Consignes de sortie"
            required
            :error="errors.consignes"
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
