<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      q: '',
      statut: '',
      service: '',
      date_rdv: '',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  q: '',
  statut: '',
  service: '',
  date_rdv: '',
})

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'Programmé', value: 'scheduled' },
  { label: 'Confirmé', value: 'confirmed' },
  { label: 'Terminé', value: 'completed' },
  { label: 'Annulé', value: 'cancelled' },
]

const serviceOptions = [
  { label: 'Tous services', value: '' },
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Triage', value: 'Triage' },
  { label: 'Laboratoire', value: 'Laboratoire' },
  { label: 'Imagerie', value: 'Imagerie' },
  { label: 'Pharmacie', value: 'Pharmacie' },
  { label: 'Administration', value: 'Administration' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
    form.service = value.service || ''
    form.date_rdv = value.date_rdv || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.statut = ''
  form.service = ''
  form.date_rdv = ''
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-7" @submit.prevent="submit">
    <BaseInput
      v-model="form.q"
      label="Recherche"
      placeholder="Patient, fiche, téléphone, médecin..."
      class="xl:col-span-2"
    />

    <BaseSelect v-model="form.service" label="Service" :options="serviceOptions" />

    <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />

    <BaseInput v-model="form.date_rdv" label="Date" type="date" />

    <div class="flex items-end gap-2 xl:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
