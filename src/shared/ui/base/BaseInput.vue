<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ""
  },
  label: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "text"
  },
  placeholder: {
    type: String,
    default: ""
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

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-100': error }"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <span v-if="error" class="mt-1 block text-xs font-medium text-red-600">
      {{ error }}
    </span>
  </label>
</template>
