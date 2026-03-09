<script setup>
import FichePayment from "../../../modules/reception/components/FichePayment.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"

defineProps({
  paymentOk: Boolean
})

const emit = defineEmits(["next", "back"])
</script>

<template>
  <div class="space-y-6">
    <FichePayment />

    <div class="flex justify-between items-center">
      <BaseButton variant="primary" @click="$emit('back')">⟵ Retour</BaseButton>
      <BaseButton variant="primary" @click="$emit('next')" :disabled="!paymentOk">
        Continuer →
      </BaseButton>
    </div>

    <div v-if="!paymentOk" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <p class="text-sm text-amber-700 flex items-center gap-2">
        <span>⚠️</span>
        Paiement obligatoire avant d'accéder au formulaire
      </p>
    </div>
  </div>
</template>