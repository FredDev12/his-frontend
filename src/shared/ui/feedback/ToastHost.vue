<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/shared/stores/toast.store'

const toast = useToastStore()

const items = computed(() => toast.items)

function classes(type) {
  return [
    type === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
    type === 'error' && 'border-red-200 bg-red-50 text-red-800',
    type === 'warning' && 'border-amber-200 bg-amber-50 text-amber-800',
    type === 'info' && 'border-blue-200 bg-blue-50 text-blue-800',
  ]
}
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
    <div
      v-for="item in items"
      :key="item.id"
      class="rounded-2xl border px-4 py-3 text-sm shadow-lg"
      :class="classes(item.type)"
    >
      <div class="flex items-start justify-between gap-4">
        <p class="font-medium">
          {{ item.message }}
        </p>

        <button
          type="button"
          class="rounded-lg px-2 text-lg leading-none hover:bg-black/5"
          @click="toast.remove(item.id)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>