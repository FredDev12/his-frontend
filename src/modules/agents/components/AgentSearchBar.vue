<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      cac_id_co: '',
      nom_post: '',
      prenom: '',
      site: '',
      telephone: '',
      fonction: '',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  cac_id_co: '',
  nom_post: '',
  prenom: '',
  site: '',
  telephone: '',
  fonction: '',
})

watch(
  () => props.filters,
  (value) => {
    form.cac_id_co = value.cac_id_co || ''
    form.nom_post = value.nom_post || ''
    form.prenom = value.prenom || ''
    form.site = value.site || ''
    form.telephone = value.telephone || ''
    form.fonction = value.fonction || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.cac_id_co = ''
  form.nom_post = ''
  form.prenom = ''
  form.site = ''
  form.telephone = ''
  form.fonction = ''

  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-8" @submit.prevent="submit">
    <BaseInput v-model="form.cac_id_co" label="CAC ID" placeholder="ID CAC" />

    <BaseInput v-model="form.nom_post" label="Nom / postnom" placeholder="Nom ou postnom" />

    <BaseInput v-model="form.prenom" label="Prénom" placeholder="Prénom" />

    <BaseInput v-model="form.site" label="Site" placeholder="Site / localité" />

    <BaseInput
      v-model="form.fonction"
      label="Fonction"
      placeholder="STORE, médecin, infirmier..."
    />

    <BaseInput v-model="form.telephone" label="Téléphone" placeholder="Téléphone" />

    <div class="flex items-end gap-2 xl:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
