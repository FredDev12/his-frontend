<script setup>
import { ref, watch } from 'vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    localValue.value = value
  },
)

function submit() {
  emit('update:modelValue', localValue.value)
  emit('search', localValue.value)
}

function reset() {
  localValue.value = ''
  emit('update:modelValue', '')
  emit('reset')
}
</script>

<template>
  <form class="flex flex-col gap-3 md:flex-row" @submit.prevent="submit">
    <input
      v-model="localValue"
      type="search"
      placeholder="Rechercher par nom, numéro patient, téléphone..."
      class="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm his-focus"
    />

    <div class="flex gap-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
