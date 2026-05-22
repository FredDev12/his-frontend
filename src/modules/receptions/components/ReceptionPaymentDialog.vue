<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  reception: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const form = reactive({
  montant: 0,
  mode_paiement: 'CASH',
  reference: '',
})

const paiementOptions = [
  { label: 'Espèces', value: 'CASH' },
  { label: 'Mobile Money', value: 'MM' },
  { label: 'Carte bancaire', value: 'CARD' },
  { label: 'Chèque', value: 'CHEQUE' },
  { label: 'Virement', value: 'VIREMENT' },
]

watch(
  () => props.reception,
  (value) => {
    form.montant = value?.montant || 0
    form.mode_paiement = value?.mode_paiement || 'CASH'
    form.reference = value?.numero_fiche || ''
  },
  { immediate: true },
)

function confirm() {
  emit('confirm', {
    paiement_effectue: true,
    montant: Number(form.montant) || 0,
    mode_paiement: form.mode_paiement,
    reference: form.reference,
    référence: form.reference,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 class="text-lg font-semibold text-slate-950">Valider le paiement</h2>

        <p class="mt-2 text-sm text-slate-500">
          Patient :
          <span class="font-medium text-slate-900">
            {{ reception?.nom }} {{ reception?.postnom }} {{ reception?.prenom }}
          </span>
        </p>

        <div class="mt-6 grid gap-4">
          <BaseInput v-model="form.montant" label="Montant payé" type="number" required />

          <BaseSelect
            v-model="form.mode_paiement"
            label="Mode de paiement"
            :options="paiementOptions"
            required
          />

          <BaseInput v-model="form.reference" label="Référence paiement" />
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <BaseButton variant="secondary" :disabled="loading" @click="$emit('cancel')">
            Annuler
          </BaseButton>

          <BaseButton variant="success" :loading="loading" @click="confirm">
            Valider paiement
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
