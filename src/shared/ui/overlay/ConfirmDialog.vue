<script setup>
import BaseButton from '@/shared/ui/base/BaseButton.vue'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmer l’action',
  },
  message: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: 'Confirmer',
  },
  cancelLabel: {
    type: String,
    default: 'Annuler',
  },
  variant: {
    type: String,
    default: 'danger',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 class="text-lg font-semibold text-slate-950">
          {{ title }}
        </h2>

        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ message }}
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <BaseButton variant="secondary" :disabled="loading" @click="$emit('cancel')">
            {{ cancelLabel }}
          </BaseButton>

          <BaseButton :variant="variant" :loading="loading" @click="$emit('confirm')">
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
