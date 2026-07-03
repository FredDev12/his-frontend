<script setup>
import { ref } from "vue"

import BaseButton from "@/shared/ui/base/BaseButton.vue"
import BaseCard from "@/shared/ui/base/BaseCard.vue"
import BaseInput from "@/shared/ui/base/BaseInput.vue"
import BaseTextarea from "@/shared/ui/base/BaseTextarea.vue"

const props = defineProps({
  initialValue: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  submitLabel: { type: String, default: "Enregistrer" },
})

const emit = defineEmits(["submit", "cancel"])

const form = ref({
  episodeId: props.initialValue.episodeId || "",
  patientId: props.initialValue.patientId || "",
  serviceId: props.initialValue.serviceId || "",
  bedNumber: props.initialValue.bedNumber || "",
  admissionReason: props.initialValue.admissionReason || "",
  recommendations: props.initialValue.recommendations || "",
})

function submit() {
  emit("submit", {
    episodeId: Number(form.value.episodeId),
    patientId: Number(form.value.patientId),
    serviceId: Number(form.value.serviceId),
    bedNumber: form.value.bedNumber,
    admissionReason: form.value.admissionReason,
    recommendations: form.value.recommendations || undefined,
  })
}
</script>

<template>
  <BaseCard title="Informations hospitalisation" subtitle="Patient, épisode, service et lit.">
    <form class="grid gap-4 md:grid-cols-2" @submit.prevent="submit">
      <BaseInput v-model="form.episodeId" label="ID épisode" type="number" required />
      <BaseInput v-model="form.patientId" label="ID patient" type="number" required />
      <BaseInput v-model="form.serviceId" label="ID service" type="number" required />
      <BaseInput v-model="form.bedNumber" label="Numéro lit" required />

      <BaseTextarea
        v-model="form.admissionReason"
        class="md:col-span-2"
        label="Motif d’admission"
        required
      />

      <BaseTextarea
        v-model="form.recommendations"
        class="md:col-span-2"
        label="Recommandations"
      />

      <div class="flex justify-end gap-3 md:col-span-2">
        <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
          Annuler
        </BaseButton>

        <BaseButton type="submit" :loading="loading">
          {{ submitLabel }}
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>
