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
  autocomplete: {
    type: String,
    default: "off",
  },
  showPasswordToggle: {
    type: Boolean,
    default: false
  }
})

defineOptions({ inheritAttrs: false })
const emit = defineEmits(["update:modelValue", "blur", "focus", "keydown", "toggle-password"])

const onInput = (e) => {
  emit("update:modelValue", e.target.value)
}

const togglePassword = () => {
  emit("toggle-password")
}

</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <div class="relative">
      <input
        v-if="type !== 'textarea'"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"      
        class="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 transition"
        :class="{ 'border-red-500': error }"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown="$emit('keydown', $event)"
      />
      
      <textarea
        v-else
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="$attrs.rows || 3"
        v-bind="$attrs"
        class="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 transition"
        :class="{ 'border-red-500': error }"
        @input="onInput"
      ></textarea>

      <button
        v-if="showPasswordToggle && type !== 'textarea'"
        type="button"
        @click="togglePassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <span>{{ type === 'password' ? '👁️' : '👁️‍🗨️' }}</span>
      </button>
    </div>

    <p v-if="error" class="text-xs text-red-600 mt-1">
      {{ error }}
    </p>
  </div>
</template>