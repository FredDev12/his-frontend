<script setup>
import { computed, ref, watch } from "vue";

import BaseButton from "@/shared/ui/base/BaseButton.vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: "Confirmer l’action"
  },
  message: {
    type: String,
    default: ""
  },
  patientName: {
    type: String,
    default: ""
  },
  patientId: {
    type: [String, Number],
    default: ""
  },
  consequence: {
    type: String,
    default: ""
  },
  confirmText: {
    type: String,
    default: "Confirmer"
  },
  requireText: {
    type: String,
    default: ""
  },
  variant: {
    type: String,
    default: "danger"
  }
});

const emit = defineEmits(["close", "confirm"]);

const typedText = ref("");

const canConfirm = computed(() => {
  if (!props.requireText) return true;
  return typedText.value === props.requireText;
});

watch(
  () => props.open,
  () => {
    typedText.value = "";
  }
);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
    role="dialog"
    aria-modal="true"
  >
    <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
      <div class="border-b border-slate-200 px-6 py-4">
        <h2 class="text-lg font-bold text-slate-950">
          {{ title }}
        </h2>
        <p v-if="message" class="mt-1 text-sm text-slate-600">
          {{ message }}
        </p>
      </div>

      <div class="space-y-4 px-6 py-5">
        <div v-if="patientName || patientId" class="rounded-xl bg-slate-50 p-4 text-sm">
          <p class="font-semibold text-slate-900">{{ patientName }}</p>
          <p class="text-slate-500">ID patient : {{ patientId }}</p>
        </div>

        <p v-if="consequence" class="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
          {{ consequence }}
        </p>

        <label v-if="requireText" class="block">
          <span class="mb-1 block text-sm font-semibold text-slate-700">
            Saisir {{ requireText }} pour confirmer
          </span>
          <input
            v-model="typedText"
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>
      </div>

      <div class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <BaseButton variant="secondary" @click="emit('close')">
          Annuler
        </BaseButton>

        <BaseButton :variant="variant" :disabled="!canConfirm" @click="emit('confirm')">
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
