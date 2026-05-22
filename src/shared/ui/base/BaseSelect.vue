<script setup>
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Sélectionner',
  },
  error: {
    type: String,
    default: '',
  },
  required: {
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

    <select
      :value="modelValue"
      :required="required"
      class="block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition his-focus"
      :class="error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">
        {{ placeholder }}
      </option>

      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <span v-if="error" class="mt-1.5 block text-sm text-red-600">
      {{ error }}
    </span>
  </label>
</template>
