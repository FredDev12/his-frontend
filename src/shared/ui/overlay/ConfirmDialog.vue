<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

const props = defineProps({
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
  patientName: {
    type: String,
    default: '',
  },
  patientId: {
    type: [String, Number],
    default: '',
  },
  consequence: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Confirmer',
  },
  requireText: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (value) =>
      ['primary', 'success', 'warning', 'danger', 'emergency'].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    default: '',
  },
  reasonRequired: {
    type: Boolean,
    default: false,
  },
  reasonLabel: {
    type: String,
    default: 'Motif',
  },
  reasonPlaceholder: {
    type: String,
    default: 'Expliquez la raison de cette action',
  },
  minReasonLength: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['close', 'confirm', 'update:reason'])

const typedText = ref('')
const confirmationInput = ref(null)

const reasonModel = computed({
  get: () => props.reason,
  set: (value) => emit('update:reason', value),
})

const normalizedReason = computed(() => props.reason.trim())

const canConfirm = computed(() => {
  if (props.loading) return false
  if (props.reasonRequired && normalizedReason.value.length < props.minReasonLength) return false
  if (!props.requireText) return true
  return typedText.value.trim() === props.requireText
})

const consequenceClasses = computed(() => {
  const classes = {
    primary: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-800',
    danger: 'bg-red-50 text-red-700',
    emergency: 'bg-rose-100 text-rose-800',
  }

  return classes[props.variant]
})

watch(
  () => props.open,
  async (isOpen) => {
    typedText.value = ''

    if (isOpen && props.requireText) {
      await nextTick()
      confirmationInput.value?.focus?.()
    }
  },
)

function close() {
  if (!props.loading) emit('close')
}

function confirm() {
  if (canConfirm.value) emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'confirm-dialog-title'"
      @keydown.esc="close"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div class="border-b border-slate-200 px-6 py-4">
          <h2 id="confirm-dialog-title" class="text-lg font-bold text-slate-950">
            {{ title }}
          </h2>

          <p v-if="message" class="mt-1 text-sm text-slate-600">
            {{ message }}
          </p>
        </div>

        <div class="space-y-4 px-6 py-5">
          <div v-if="patientName || patientId" class="rounded-xl bg-slate-50 p-4 text-sm">
            <p class="font-semibold text-slate-900">
              {{ patientName || 'Patient non renseigné' }}
            </p>
            <p class="text-slate-500">
              ID patient : {{ patientId || 'Non renseigné' }}
            </p>
          </div>

          <p
            v-if="consequence"
            class="rounded-xl p-4 text-sm font-medium"
            :class="consequenceClasses"
          >
            {{ consequence }}
          </p>


          <div v-if="reasonRequired">
            <BaseTextarea
              v-model="reasonModel"
              :label="reasonLabel"
              :placeholder="reasonPlaceholder"
              :disabled="loading"
              :rows="3"
            />
            <p class="mt-1 text-xs text-slate-500">
              Minimum {{ minReasonLength }} caractères. Ce motif sera conservé dans l’audit.
            </p>
          </div>

          <div v-if="requireText">
            <BaseInput
              ref="confirmationInput"
              v-model="typedText"
              :label="`Saisir ${requireText} pour confirmer`"
              :placeholder="requireText"
              :disabled="loading"
              autocomplete="off"
              @keydown.enter.prevent="confirm"
            />
          </div>
        </div>

        <div class="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <BaseButton variant="secondary" :disabled="loading" @click="close">
            Retour
          </BaseButton>

          <BaseButton
            :variant="variant"
            :disabled="!canConfirm"
            :loading="loading"
            loading-text="Traitement..."
            @click="confirm"
          >
            {{ confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
