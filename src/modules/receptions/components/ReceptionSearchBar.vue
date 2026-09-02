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
      payment: '',
      status: '',
      patientType: '',
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
  payment: '',
  status: '',
  patientType: '',
})

const paymentOptions = [
  { label: 'Tous paiements', value: '' },
  { label: 'Frais requis', value: 'REQUIRED' },
  { label: 'Frais non requis', value: 'NOT_REQUIRED' },
  { label: 'Payé', value: 'PAID' },
  { label: 'À régulariser', value: 'UNPAID' },
]

const statusOptions = [
  { label: 'Tous statuts', value: '' },
  { label: 'Admis', value: 'ADMIS' },
  { label: 'Paiement en attente', value: 'EN_ATTENTE_PAIEMENT' },
  { label: 'Brouillon', value: 'BROUILLON' },
  { label: 'Annulée', value: 'ANNULE' },
]

const patientTypeOptions = [
  { label: 'Tous types', value: '' },
  { label: 'Public', value: 'PUBLIC' },
  { label: 'Agent CAC', value: 'AGENT_CAC' },
  { label: 'Ayant droit', value: 'AYANT_DROIT' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.payment = value.payment || ''
    form.status = value.status || ''
    form.patientType = value.patientType || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  if (props.loading) return
  emit('search', { ...form })
}

function reset() {
  if (props.loading) return

  form.q = ''
  form.payment = ''
  form.status = ''
  form.patientType = ''

  emit('reset')
}
</script>

<template>
  <form class="grid w-full grid-cols-1 gap-3 lg:grid-cols-12" @submit.prevent="submit">
    <div class="min-w-0 lg:col-span-4">
      <BaseInput
        v-model="form.q"
        type="search"
        placeholder="Nom, numéro patient, réception, épisode, téléphone..."
        :disabled="loading"
      />
    </div>

    <div class="min-w-0 lg:col-span-3">
      <BaseSelect
        v-model="form.payment"
        :options="paymentOptions"
        placeholder="Paiement"
        :disabled="loading"
      />
    </div>

    <div class="min-w-0 lg:col-span-2">
      <BaseSelect
        v-model="form.status"
        :options="statusOptions"
        placeholder="Statut"
        :disabled="loading"
      />
    </div>

    <div class="min-w-0 lg:col-span-3">
      <BaseSelect
        v-model="form.patientType"
        :options="patientTypeOptions"
        placeholder="Type patient"
        :disabled="loading"
      />
    </div>

    <div class="flex min-w-0 flex-col gap-2 sm:flex-row lg:col-span-12">
      <BaseButton
        type="submit"
        class="w-full justify-center sm:w-auto"
        :loading="loading"
        loading-text="Recherche..."
      >
        Rechercher
      </BaseButton>

      <BaseButton
        type="button"
        variant="secondary"
        class="w-full justify-center sm:w-auto"
        :disabled="loading"
        @click="reset"
      >
        Réinitialiser
      </BaseButton>
    </div>
  </form>
</template>
