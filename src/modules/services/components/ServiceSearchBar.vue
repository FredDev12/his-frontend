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
      categorie: '',
      module_source: '',
      visible_dans_facturation: '',
      visible_dans_reception: '',
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
  categorie: '',
  module_source: '',
  visible_dans_facturation: '',
  visible_dans_reception: '',
})

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

const moduleOptions = [
  { label: 'Tous modules', value: '' },
  { label: 'Réception', value: 'reception' },
  { label: 'Consultations', value: 'consultations' },
  { label: 'Laboratoire', value: 'laboratoire' },
  { label: 'Imagerie', value: 'imagerie' },
  { label: 'Pharmacie', value: 'pharmacie' },
  { label: 'Caisse', value: 'caisse' },
  { label: 'Facturation', value: 'facturation' },
  { label: 'Sorties', value: 'sorties' },
  { label: 'Autre', value: 'autre' },
]

const booleanOptions = [
  { label: 'Tous', value: '' },
  { label: 'Oui', value: 'true' },
  { label: 'Non', value: 'false' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
    form.categorie = value.categorie || ''
    form.module_source = value.module_source || ''
    form.visible_dans_facturation = value.visible_dans_facturation ?? ''
    form.visible_dans_reception = value.visible_dans_reception ?? ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.statut = ''
  form.categorie = ''
  form.module_source = ''
  form.visible_dans_facturation = ''
  form.visible_dans_reception = ''

  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-8" @submit.prevent="submit">
    <BaseInput
      v-model="form.q"
      label="Recherche"
      placeholder="Code, nom, catégorie..."
      class="xl:col-span-2"
    />

    <BaseInput v-model="form.categorie" label="Catégorie" placeholder="Accueil, consultation..." />

    <BaseSelect v-model="form.module_source" label="Module" :options="moduleOptions" />

    <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />

    <BaseSelect
      v-model="form.visible_dans_facturation"
      label="Facturation"
      :options="booleanOptions"
    />

    <BaseSelect v-model="form.visible_dans_reception" label="Réception" :options="booleanOptions" />

    <div class="flex items-end gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
