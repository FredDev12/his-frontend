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
      statut: '',
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
  statut: '',
})

const serviceOptions = [
  { label: 'Tous les services', value: '' },
  { label: 'Médecine interne', value: 'MÉDECINE INTERNE' },
  { label: 'Pédiatrie', value: 'PÉDIATRIE' },
  { label: 'Gynéco-obstétrique', value: 'GYNÉCO-OBSTÉTRIQUE' },
  { label: 'Chirurgie', value: 'CHIRURGIE' },
]

const statutOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'En cours', value: 'active' },
  { label: 'Terminée', value: 'completed' },
  { label: 'Annulée', value: 'cancelled' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.service = value.service || ''
    form.statut = value.statut || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.service = ''
  form.statut = ''

  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-5" @submit.prevent="submit">
    <input
      v-model="form.q"
      type="search"
      placeholder="Rechercher patient, fiche, diagnostic..."
      class="min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus xl:col-span-2"
    />

    <BaseSelect v-model="form.service" :options="serviceOptions" placeholder="Service" />
    <BaseSelect v-model="form.statut" :options="statutOptions" placeholder="Statut" />

    <div class="flex gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
