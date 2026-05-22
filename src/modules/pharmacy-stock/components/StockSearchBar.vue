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
      stock_state: '',
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
  stock_state: '',
})

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

const stockOptions = [
  { label: 'Tout stock', value: '' },
  { label: 'Disponible', value: 'ok' },
  { label: 'Stock faible', value: 'low' },
  { label: 'Rupture', value: 'out' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
    form.categorie = value.categorie || ''
    form.stock_state = value.stock_state || ''
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
  form.stock_state = ''
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-7" @submit.prevent="submit">
    <BaseInput
      v-model="form.q"
      label="Recherche"
      placeholder="Nom, code, fournisseur, emplacement..."
      class="xl:col-span-2"
    />

    <BaseInput
      v-model="form.categorie"
      label="Catégorie"
      placeholder="Antibiotique, antalgique..."
    />

    <BaseSelect v-model="form.stock_state" label="État stock" :options="stockOptions" />

    <BaseSelect v-model="form.statut" label="Statut" :options="statutOptions" />

    <div class="flex items-end gap-2 xl:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
