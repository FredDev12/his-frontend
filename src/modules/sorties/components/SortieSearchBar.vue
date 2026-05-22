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
      type_sortie: '',
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
  type_sortie: '',
})

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'En attente', value: 'pending' },
  { label: 'Sortie validée', value: 'validated' },
  { label: 'Annulée', value: 'cancelled' },
]

const typeSortieOptions = [
  { label: 'Tous types', value: '' },
  { label: 'Sortie simple', value: 'SIMPLE' },
  { label: 'Transfert', value: 'TRANSFERT' },
  { label: 'Contre avis médical', value: 'CONTRE_AVIS' },
  { label: 'Évasion', value: 'EVASION' },
  { label: 'Décès', value: 'DECES' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.statut = value.statut || ''
    form.type_sortie = value.type_sortie || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.statut = ''
  form.type_sortie = ''
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 lg:grid-cols-6" @submit.prevent="submit">
    <input
      v-model="form.q"
      type="search"
      placeholder="Rechercher patient, fiche, motif, destination..."
      class="min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus lg:col-span-2"
    />

    <BaseSelect
      v-model="form.type_sortie"
      :options="typeSortieOptions"
      placeholder="Type de sortie"
    />

    <BaseSelect v-model="form.statut" :options="statutOptions" placeholder="Statut" />

    <div class="flex gap-2 lg:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
