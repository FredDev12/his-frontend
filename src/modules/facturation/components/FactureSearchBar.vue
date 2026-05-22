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
      date: '',
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
  date: '',
})

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'Brouillon', value: 'draft' },
  { label: 'Émise', value: 'issued' },
  { label: 'Payée', value: 'paid' },
  { label: 'Annulée', value: 'cancelled' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
    form.date = value.date || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.statut = ''
  form.date = ''
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-6" @submit.prevent="submit">
    <BaseInput
      v-model="form.q"
      label="Recherche"
      placeholder="Facture, patient, fiche, téléphone..."
      class="xl:col-span-2"
    />

    <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />
    <BaseInput v-model="form.date" label="Date" type="date" />

    <div class="flex items-end gap-2 xl:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
