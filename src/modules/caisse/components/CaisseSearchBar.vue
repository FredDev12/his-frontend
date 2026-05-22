<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      q: '',
      statut: '',
      service: '',
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
})

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'En attente', value: 'pending' },
  { label: 'Payé', value: 'paid' },
  { label: 'Annulé', value: 'cancelled' },
]

const serviceOptions = [
  { label: 'Tous services', value: '' },
  { label: 'Réception', value: 'Réception' },
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Laboratoire', value: 'Laboratoire' },
  { label: 'Imagerie', value: 'Imagerie' },
  { label: 'Pharmacie', value: 'Pharmacie' },
  { label: 'Hospitalisation', value: 'Hospitalisation' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
    form.service = value.service || ''
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
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 lg:grid-cols-6" @submit.prevent="submit">
    <input
      v-model="form.q"
      type="search"
      placeholder="Rechercher patient, fiche, référence, montant..."
      class="min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus lg:col-span-2"
    />

    <BaseSelect v-model="form.service" :options="serviceOptions" placeholder="Service" />

    <BaseSelect v-model="form.statut" :options="statutOptions" placeholder="Statut" />

    <div class="flex gap-2 lg:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
