<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["update:modelValue", "blur", "focus", "keydown"])

const onInput = (e) => {
  emit("update:modelValue", e.target.value)
}
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="text-sm text-gray-600">
      {{ label }}
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
      @input="onInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      @keydown="$emit('keydown', $event)"
    />

    <p v-if="error" class="text-xs text-red-600">
      {{ error }}
    </p>
  </div>
</template>