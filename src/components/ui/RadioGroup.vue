<!-- components/RadioGroup.vue -->
<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="flex space-x-4">
      <label 
        v-for="option in options" 
        :key="option.value"
        class="flex items-center space-x-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
        :class="{ 
          'border-blue-500 bg-blue-50': modelValue === option.value && option.color === 'blue',
          'border-pink-500 bg-pink-50': modelValue === option.value && option.color === 'pink'
        }"
      >
        <input 
          type="radio" 
          :value="option.value" 
          :checked="modelValue === option.value"
          @change="$emit('update:modelValue', option.value)"
          class="hidden"
        >
        <span v-if="option.icon" class="text-xl mr-1">{{ option.icon }}</span>
        <span class="text-sm">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: String,
  options: Array
})

defineEmits(['update:modelValue'])
</script>