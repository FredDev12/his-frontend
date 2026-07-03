<script setup>
defineProps({
  modelValue: {
    type: [String, Number, null],
    default: ""
  },
  label: {
    type: String,
    default: ""
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: "Sélectionner"
  },
  error: {
    type: String,
    default: ""
  },
  required: {
    type: Boolean,
    default: false
  }
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-semibold text-slate-700">
      {{ label }}
      <span v-if="required" class="text-red-600">*</span>
    </span>

    <select
      :value="modelValue"
      class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-100': error }"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value ?? option.id"
        :value="option.value ?? option.id"
      >
        {{ option.label ?? option.name }}
      </option>
    </select>

    <span v-if="error" class="mt-1 block text-xs font-medium text-red-600">
      {{ error }}
    </span>
  </label>
</template>
