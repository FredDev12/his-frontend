<script setup>
import { reactive, watch } from 'vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      q: '',
      urgence: '',
      service: '',
      paye: '',
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
  urgence: '',
  service: '',
  paye: '',
})

const urgenceOptions = [
  { label: 'Toutes', value: '' },
  { label: 'Urgences uniquement', value: 'true' },
  { label: 'Non urgentes', value: 'false' },
]

const paiementOptions = [
  { label: 'Tous', value: '' },
  { label: 'Payées', value: 'true' },
  { label: 'Non payées', value: 'false' },
]

const serviceOptions = [
  { label: 'Tous les services', value: '' },
  { label: 'Médecine interne', value: 'MÉDECINE INTERNE' },
  { label: 'Pédiatrie', value: 'PÉDIATRIE' },
  { label: 'Gynéco-obstétrique', value: 'GYNÉCO-OBSTÉTRIQUE' },
  { label: 'Chirurgie', value: 'CHIRURGIE' },
  { label: 'Laboratoire', value: 'LABORATOIRE' },
  { label: 'Imagerie', value: 'IMAGERIE' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.urgence = value.urgence || ''
    form.service = value.service || ''
    form.paye = value.paye || ''
  },
  { immediate: true, deep: true },
)

function toBooleanOrEmpty(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  return ''
}

function submit() {
  emit('search', {
    q: form.q,
    urgence: toBooleanOrEmpty(form.urgence),
    service: form.service,
    paye: toBooleanOrEmpty(form.paye),
  })
}

function reset() {
  form.q = ''
  form.urgence = ''
  form.service = ''
  form.paye = ''

  emit('reset')
}
</script>
<template>
  <form class="grid gap-3 xl:grid-cols-6" @submit.prevent="submit">
    <input
      v-model="form.q"
      type="search"
      placeholder="Rechercher patient, fiche, téléphone..."
      class="min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus xl:col-span-2"
    />

    <BaseSelect v-model="form.service" :options="serviceOptions" placeholder="Service" />

    <BaseSelect v-model="form.urgence" :options="urgenceOptions" placeholder="Urgence" />

    <BaseSelect v-model="form.paye" :options="paiementOptions" placeholder="Paiement" />

    <div class="flex gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
