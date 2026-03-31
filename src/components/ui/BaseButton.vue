<script setup>
import { computed } from "vue"

const props = defineProps({
  variant: { type: String, default: "primary" },
  loading: Boolean,
  disabled: Boolean,
  type: { type: String, default: "button" }
})

const emit = defineEmits(["click"])

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300"
}

const isDisabled = computed(() => props.loading || props.disabled)

const onClick = (e) => {
  if (isDisabled.value) return
  emit("click", e)
}
</script>

<template>
  <button
    class="px-4 py-2 rounded-lg font-medium transition inline-flex items-center gap-2 justify-center"
    :class="variants[variant]"
    :disabled="isDisabled"
    :type="type"
    @click="onClick"
  >
    <div
      v-if="loading"
      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
    ></div>

    <slot />
  </button>
</template>