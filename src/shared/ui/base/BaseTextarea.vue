<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 3,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-red-600">*</span>
    </span>

    <textarea
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 his-focus"
      :class="[
        error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300',
        disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : '',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <span v-if="error" class="mt-1.5 block text-sm text-red-600">
      {{ error }}
    </span>
  </label>
</template>
