<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    default: null,
  },
  type: {
    type: String,
    default: 'IN',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel', 'confirm'])

const form = reactive({
  quantity: '',
  reason: '',
})

const errors = reactive({
  quantity: '',
  reason: '',
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.quantity = ''
      form.reason = ''
      errors.quantity = ''
      errors.reason = ''
    }
  },
)

function title() {
  if (props.type === 'IN') return 'Entrée stock'
  if (props.type === 'OUT') return 'Sortie stock'
  if (props.type === 'ADJUST') return 'Ajustement stock'
  return 'Mouvement stock'
}

function confirmLabel() {
  if (props.type === 'IN') return 'Confirmer entrée'
  if (props.type === 'OUT') return 'Confirmer sortie'
  if (props.type === 'ADJUST') return 'Confirmer ajustement'
  return 'Confirmer'
}

function validate() {
  errors.quantity = ''
  errors.reason = ''

  if (!form.quantity || Number(form.quantity) <= 0) {
    errors.quantity = 'Quantité obligatoire.'
  }

  if (!form.reason) {
    errors.reason = 'Motif obligatoire pour audit interne.'
  }

  return !errors.quantity && !errors.reason
}

function confirm() {
  if (!validate()) return

  emit('confirm', {
    type: props.type,
    quantity: Number(form.quantity),
    reason: form.reason,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="text-lg font-semibold text-slate-950">
          {{ title() }}
        </h2>

        <p class="mt-2 text-sm leading-6 text-slate-600">
          Produit :
          <strong>{{ product?.nom || '—' }}</strong>
          · Stock actuel :
          <strong>{{ product?.quantite ?? '—' }} {{ product?.unite || '' }}</strong>
        </p>

        <div class="mt-5 space-y-4">
          <BaseInput
            v-model="form.quantity"
            label="Quantité"
            type="number"
            required
            :error="errors.quantity"
          />

          <BaseTextarea
            v-model="form.reason"
            label="Motif"
            required
            :error="errors.reason"
            placeholder="Exemple : Réception fournisseur, délivrance patient, correction inventaire..."
            :rows="3"
          />
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
            Annuler
          </BaseButton>

          <BaseButton type="button" variant="warning" :loading="loading" @click="confirm">
            {{ confirmLabel() }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
