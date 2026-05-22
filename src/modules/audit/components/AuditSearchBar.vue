<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      q: '',
      action: '',
      entite: '',
      role: '',
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  q: '',
  action: '',
  entite: '',
  role: '',
})

const actionOptions = [
  { label: 'Toutes actions', value: '' },
  { label: 'Création', value: 'CREATE' },
  { label: 'Modification', value: 'UPDATE' },
  { label: 'Suppression', value: 'DELETE' },
  { label: 'Validation', value: 'VALIDATE' },
  { label: 'Annulation', value: 'CANCEL' },
  { label: 'Connexion', value: 'LOGIN' },
  { label: 'Déconnexion', value: 'LOGOUT' },
  { label: 'Reset mot de passe', value: 'RESET_PASSWORD' },
]

const roleOptions = [
  { label: 'Tous rôles', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Médecin', value: 'medecin' },
  { label: 'Secrétaire', value: 'secretaire' },
  { label: 'Patient', value: 'patient' },
]

watch(
  () => props.filters,
  (value) => {
    form.q = value.q || ''
    form.action = value.action || ''
    form.entite = value.entite || ''
    form.role = value.role || ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { ...form })
}

function reset() {
  form.q = ''
  form.action = ''
  form.entite = ''
  form.role = ''

  emit('reset')
}
</script>

<template>
  <form class="grid gap-3 xl:grid-cols-7" @submit.prevent="submit">
    <BaseInput
      v-model="form.q"
      label="Recherche"
      placeholder="Utilisateur, IP, entité, requestId..."
      class="xl:col-span-2"
    />

    <BaseSelect v-model="form.action" label="Action" :options="actionOptions" />

    <BaseInput v-model="form.entite" label="Entité" placeholder="patients, users, caisse..." />

    <BaseSelect v-model="form.role" label="Rôle" :options="roleOptions" />

    <div class="flex items-end gap-2 xl:col-span-2">
      <BaseButton type="submit" :loading="loading"> Rechercher </BaseButton>

      <BaseButton type="button" variant="secondary" @click="reset"> Réinitialiser </BaseButton>
    </div>
  </form>
</template>
