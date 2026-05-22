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
      type: '',
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
  type: '',
})

const typeOptions = [
  { label: 'Tous types', value: '' },
  { label: 'Radiographie', value: 'RADIOGRAPHIE' },
  { label: 'Échographie', value: 'ÉCHOGRAPHIE' },
  { label: 'Scanner', value: 'SCANNER' },
  { label: 'IRM', value: 'IRM' },
  { label: 'ECG', value: 'ECG' },
  { label: 'Autre', value: 'AUTRE' },
]

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'En attente', value: 'pending' },
  { label: 'Compte rendu disponible', value: 'completed' },
  { label: 'Annulé', value: 'cancelled' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
    form.type = value.type || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.statut = ''
  form.type = ''
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 lg:grid-cols-5" @submit.prevent="submit">
    <input
      v-model="form.q"
      type="search"
      placeholder="Rechercher patient, fiche, examen, conclusion..."
      class="min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus lg:col-span-2"
    />

    <BaseSelect v-model="form.type" :options="typeOptions" placeholder="Type" />

    <BaseSelect v-model="form.statut" :options="statutOptions" placeholder="Statut" />

    <div class="flex gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
