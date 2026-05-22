<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      date_from: '',
      date_to: '',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['apply', 'reset'])

const form = reactive({
  date_from: '',
  date_to: '',
})

watch(
  () => props.filters,
  (value) => {
    form.date_from = value.date_from || ''
    form.date_to = value.date_to || ''
  },
  { immediate: true, deep: true },
)

function apply() {
  emit('apply', { ...form })
}

function reset() {
  form.date_from = ''
  form.date_to = ''

  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 md:grid-cols-4" @submit.prevent="apply">
    <BaseInput v-model="form.date_from" label="Date début" type="date" />

    <BaseInput v-model="form.date_to" label="Date fin" type="date" />

    <div class="flex items-end gap-2 md:col-span-2">
      <BaseButton type="submit" :loading="loading"> Appliquer </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
