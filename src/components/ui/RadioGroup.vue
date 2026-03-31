<!-- components/ui/RadioGroup.vue -->
<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="flex flex-wrap gap-2">
      <label 
        v-for="option in options" 
        :key="option.value"
        class="flex items-center space-x-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
        :class="getOptionClass(option)"
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
import { computed } from 'vue'

const props = defineProps({
  label: String,
  modelValue: String,
  options: Array
})

defineEmits(['update:modelValue'])

// Fonction pour déterminer la classe CSS en fonction de la couleur et de l'état sélectionné
const getOptionClass = (option) => {
  const isSelected = props.modelValue === option.value
  
  // Classes de base pour toutes les options
  const baseClasses = []
  
  if (isSelected) {
    // Appliquer la couleur correspondante quand l'option est sélectionnée
    switch(option.color) {
      case 'blue':
        baseClasses.push('border-blue-500', 'bg-blue-50')
        break
      case 'pink':
        baseClasses.push('border-pink-500', 'bg-pink-50')
        break
      case 'red':
        baseClasses.push('border-red-500', 'bg-red-50')
        break
      case 'green':
        baseClasses.push('border-green-500', 'bg-green-50')
        break
      case 'yellow':
        baseClasses.push('border-yellow-500', 'bg-yellow-50')
        break
      case 'purple':
        baseClasses.push('border-purple-500', 'bg-purple-50')
        break
      case 'gray':
      case 'black':
        baseClasses.push('border-gray-500', 'bg-gray-50')
        break
      default:
        baseClasses.push('border-blue-500', 'bg-blue-50')
    }
  } else {
    // Option non sélectionnée
    baseClasses.push('border-gray-200')
  }
  
  return baseClasses
}
</script>