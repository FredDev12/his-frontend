<script setup>
import BaseButton from '@/shared/ui/base/BaseButton.vue'

defineProps({
  page: {
    type: Number,
    default: 1,
  },
  hasPrev: {
    type: Boolean,
    default: false,
  },
  hasNext: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'page-change',
])
</script>

<template>
  <div
    class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm text-slate-500">
      {{ label }}
    </p>

    <div class="flex gap-2">
      <BaseButton
        variant="secondary"
        :disabled="
          disabled ||
          !hasPrev
        "
        @click="
          emit(
            'page-change',
            Math.max(1, page - 1),
          )
        "
      >
        Précédent
      </BaseButton>

      <BaseButton
        variant="secondary"
        :disabled="
          disabled ||
          !hasNext
        "
        @click="
          emit(
            'page-change',
            page + 1,
          )
        "
      >
        Suivant
      </BaseButton>
    </div>
  </div>
</template>
