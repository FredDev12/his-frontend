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
      type: '',
      priority: '',
      read: '',
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
  type: '',
  priority: '',
  read: '',
})

const typeOptions = [
  { label: 'Tous types', value: '' },
  { label: 'Information', value: 'INFO' },
  { label: 'Succès', value: 'SUCCESS' },
  { label: 'Attention', value: 'WARNING' },
  { label: 'Critique', value: 'DANGER' },
  { label: 'Urgence', value: 'EMERGENCY' },
]

const priorityOptions = [
  { label: 'Toutes priorités', value: '' },
  { label: 'Basse', value: 'low' },
  { label: 'Normale', value: 'normal' },
  { label: 'Haute', value: 'high' },
  { label: 'Urgente', value: 'urgent' },
]

const readOptions = [
  { label: 'Toutes', value: '' },
  { label: 'Non lues', value: 'false' },
  { label: 'Lues', value: 'true' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.type = value.type || ''
    form.priority = value.priority || ''
    form.read = value.read || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.type = ''
  form.priority = ''
  form.read = ''

  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-7" @submit.prevent="submit">
    <BaseInput
      v-model="form.q"
      label="Recherche"
      placeholder="Titre, message, module, entité..."
      class="xl:col-span-2"
    />

    <BaseSelect v-model="form.type" label="Type" :options="typeOptions" />

    <BaseSelect v-model="form.priority" label="Priorité" :options="priorityOptions" />

    <BaseSelect v-model="form.read" label="Lecture" :options="readOptions" />

    <div class="flex items-end gap-2 xl:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
