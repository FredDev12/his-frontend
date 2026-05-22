<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
  },
})
</script>

<template>
  <span
    class="inline-block animate-spin rounded-full border-2 border-current border-r-transparent"
    :class="[
      size === 'sm' && 'h-4 w-4',
      size === 'md' && 'h-5 w-5',
      size === 'lg' && 'h-8 w-8',
    ]"
  />
</template>