<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  initialValue: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: 'Créer utilisateur',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  nom: '',
  prenom: '',
  email: '',
  role: 'patient',
  password: '',
})

const errors = reactive({})

const roleOptions = [
  { label: 'Administrateur', value: 'admin' },
  { label: 'Médecin', value: 'medecin' },
  { label: 'Secrétaire', value: 'secretaire' },
  { label: 'Patient', value: 'patient' },
]

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    form.nom = value.nom || ''
    form.prenom = value.prenom || ''
    form.email = value.email || ''
    form.role = value.role || 'patient'
    form.password = ''
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validate() {
  clearErrors()

  if (!form.nom) errors.nom = 'Nom obligatoire.'
  if (!form.prenom) errors.prenom = 'Prénom obligatoire.'
  if (!form.email) errors.email = 'Email obligatoire.'
  if (!form.role) errors.role = 'Rôle obligatoire.'

  if (!props.initialValue && !form.password) {
    errors.password = 'Mot de passe obligatoire.'
  }

  if (form.password && form.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères.'
  }

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  const payload = {
    nom: form.nom,
    prenom: form.prenom,
    email: form.email,
    role: form.role,
  }

  if (!props.initialValue) {
    payload.password = form.password
  }

  return payload
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard
      title="Compte utilisateur"
      subtitle="Identité, email de connexion et rôle applicatif."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <BaseInput v-model="form.nom" label="Nom" required :error="errors.nom" />

        <BaseInput v-model="form.prenom" label="Prénom" required :error="errors.prenom" />

        <BaseInput v-model="form.email" label="Email" type="email" required :error="errors.email" />

        <BaseSelect
          v-model="form.role"
          label="Rôle"
          :options="roleOptions"
          required
          :error="errors.role"
        />

        <BaseInput
          v-if="!initialValue"
          v-model="form.password"
          label="Mot de passe"
          type="password"
          required
          :error="errors.password"
          placeholder="Minimum 6 caractères"
        />
      </div>
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')"> Annuler </BaseButton>

      <BaseButton type="submit" :loading="loading">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>
