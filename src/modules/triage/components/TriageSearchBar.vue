<script setup>
import { reactive, watch } from 'vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      q: '',
      service: '',
      priorite: '',
      type_passage: '',
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
  service: '',
  priorite: '',
  type_passage: '',
})

const serviceOptions = [
  { label: 'Tous les services', value: '' },
  { label: 'Médecine interne', value: 'MÉDECINE INTERNE' },
  { label: 'Pédiatrie', value: 'PÉDIATRIE' },
  { label: 'Gynéco-obstétrique', value: 'GYNÉCO-OBSTÉTRIQUE' },
  { label: 'Chirurgie', value: 'CHIRURGIE' },
  { label: 'Laboratoire', value: 'LABORATOIRE' },
  { label: 'Imagerie', value: 'IMAGERIE' },
]

const prioriteOptions = [
  { label: 'Toutes priorités', value: '' },
  { label: 'Routine', value: 'ROUTINE' },
  { label: 'Urgent', value: 'URGENT' },
]

const typePassageOptions = [
  { label: 'Tous passages', value: '' },
  { label: 'Nouveau', value: 'NOUVEAU' },
  { label: 'Contrôle', value: 'CONTRÔLE' },
  { label: 'Référence', value: 'RÉFÉRENCE' },
  { label: 'Urgence', value: 'URGENCE' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.service = value.service || ''
    form.priorite = value.priorite || ''
    form.type_passage = value.type_passage || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.service = ''
  form.priorite = ''
  form.type_passage = ''

  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-6" @submit.prevent="submit">
    <input
      v-model="form.q"
      type="search"
      placeholder="Rechercher patient, fiche, numéro..."
      class="min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus xl:col-span-2"
    />

    <BaseSelect v-model="form.service" :options="serviceOptions" placeholder="Service" />
    <BaseSelect v-model="form.priorite" :options="prioriteOptions" placeholder="Priorité" />
    <BaseSelect v-model="form.type_passage" :options="typePassageOptions" placeholder="Passage" />

    <div class="flex gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
