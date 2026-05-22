<script setup>
import { ref } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Nouvelle valeur',
  },
})

const emit = defineEmits(['update:modelValue'])

const newValue = ref('')

function addItem() {
  const value = newValue.value.trim()

  if (!value) return

  const next = [...props.modelValue]

  if (!next.includes(value)) {
    next.push(value)
  }

  emit('update:modelValue', next)
  newValue.value = ''
}

function removeItem(index) {
  const next = props.modelValue.filter((_, itemIndex) => itemIndex !== index)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div>
      <h3 class="font-semibold text-slate-950">
        {{ title }}
      </h3>

      <p v-if="subtitle" class="mt-1 text-sm text-slate-500">
        {{ subtitle }}
      </p>
    </div>

    <div class="mt-4 flex flex-col gap-3 sm:flex-row">
      <BaseInput
        v-model="newValue"
        :placeholder="placeholder"
        class="flex-1"
        @keyup.enter.prevent="addItem"
      />

      <BaseButton type="button" variant="secondary" @click="addItem"> Ajouter </BaseButton>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="(item, index) in modelValue"
        :key="`${item}-${index}`"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
      >
        {{ item }}

        <button type="button" class="text-slate-400 hover:text-red-600" @click="removeItem(index)">
          ×
        </button>
      </span>

      <span v-if="modelValue.length === 0" class="text-sm text-slate-500">
        Aucune valeur définie.
      </span>
    </div>
  </div>
</template>
