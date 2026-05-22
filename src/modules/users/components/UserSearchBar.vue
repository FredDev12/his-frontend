<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      search: '',
      role: '',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  search: '',
  role: '',
})

const roleOptions = [
  { label: 'Tous rôles', value: '' },
  { label: 'Administrateur', value: 'admin' },
  { label: 'Médecin', value: 'medecin' },
  { label: 'Secrétaire', value: 'secretaire' },
  { label: 'Patient', value: 'patient' },
]

watch(
  () => props.filters,
  (value) => {
    form.search = value.search || ''
    form.role = value.role || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.search = ''
  form.role = ''
  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 md:grid-cols-4" @submit.prevent="submit">
    <BaseInput
      v-model="form.search"
      label="Recherche"
      placeholder="Nom, prénom ou email..."
      class="md:col-span-2"
    />

    <BaseSelect
      v-model="form.role"
      label="Rôle"
      :options="roleOptions"
      placeholder="Selectionnez un role"
    />

    <div class="flex items-end gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
