<script setup>
import { useToastStore } from "../../stores/toast.store"
import { TransitionGroup } from "vue"

const toast = useToastStore()

function toastsByPosition(position) {
  return toast.toasts.filter(t => t.position === position)
}

function positionClasses(pos) {
  switch (pos) {
    case "top-right": return "top-6 right-6 items-end"
    case "top-left": return "top-6 left-6 items-start"
    case "bottom-right": return "bottom-6 right-6 items-end"
    case "bottom-left": return "bottom-6 left-6 items-start"
    case "center": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center"
  }
}
</script>

<template>
  <div>
    <div
      v-for="pos in ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'center']"
      :key="pos"
      :class="positionClasses(pos)"
      class="fixed z-50 flex flex-col space-y-3 p-4"
    >
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="t in toastsByPosition(pos)"
          :key="t.id"
          @click="toast.remove(t.id)"
          class="px-6 py-4 rounded-lg shadow-lg text-white cursor-pointer hover:opacity-90 transition-opacity duration-200 break-words max-w-md text-center text-base font-medium"
          :class="{
            'bg-blue-600': t.type === 'info',
            'bg-green-600': t.type === 'success',
            'bg-red-600': t.type === 'error',
            'bg-yellow-500': t.type === 'warning'
          }"
        >
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
.toast-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}
.toast-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.toast-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s ease;
}
</style>