<script setup>
import { ref } from "vue"

import BaseButton from "@/shared/ui/base/BaseButton.vue"
import BaseCard from "@/shared/ui/base/BaseCard.vue"
import BaseInput from "@/shared/ui/base/BaseInput.vue"
import BaseTextarea from "@/shared/ui/base/BaseTextarea.vue"

const props = defineProps({
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(["submit", "cancel"])

const form = ref({
  episodeId: "",
  patientId: "",
  motif: "",
  resume: "",
  recommandations: "",
  confirmation: "",
})

function submit() {
  emit("submit", {
    episodeId: Number(form.value.episodeId),
    patientId: Number(form.value.patientId),
    motif: form.value.motif,
    resume: form.value.resume,
    recommandations: form.value.recommandations,
  })
}
</script>

<template>
  <BaseCard title="Sortie patient" subtitle="Clôture officielle de l’épisode de soins.">
    <form class="grid gap-4 md:grid-cols-2" @submit.prevent="submit">
      <BaseInput v-model="form.episodeId" label="ID épisode" type="number" required />
      <BaseInput v-model="form.patientId" label="ID patient" type="number" required />

      <BaseTextarea v-model="form.motif" class="md:col-span-2" label="Motif de sortie" required />
      <BaseTextarea v-model="form.resume" class="md:col-span-2" label="Résumé médical" required />
      <BaseTextarea v-model="form.recommandations" class="md:col-span-2" label="Recommandations" />

      <BaseInput
        v-model="form.confirmation"
        class="md:col-span-2"
        label="Tapez CONFIRMER pour valider la sortie"
        placeholder="CONFIRMER"
        required
      />

      <div class="flex justify-end gap-3 md:col-span-2">
        <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
          Annuler
        </BaseButton>

        <BaseButton
          type="submit"
          variant="warning"
          :loading="loading"
          :disabled="form.confirmation !== 'CONFIRMER'"
        >
          Valider sortie
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>
