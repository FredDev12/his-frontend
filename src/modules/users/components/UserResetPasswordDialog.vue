<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel', 'confirm'])

const form = reactive({
  newPassword: '',
})

const errors = reactive({
  newPassword: '',
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.newPassword = ''
      errors.newPassword = ''
    }
  },
)

function fullName() {
  if (!props.user) return 'cet utilisateur'
  return [props.user.nom, props.user.prenom].filter(Boolean).join(' ') || props.user.email
}

function confirm() {
  errors.newPassword = ''

  if (!form.newPassword) {
    errors.newPassword = 'Nouveau mot de passe obligatoire.'
    return
  }

  if (form.newPassword.length < 6) {
    errors.newPassword = 'Minimum 6 caractères.'
    return
  }

  emit('confirm', form.newPassword)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="text-lg font-semibold text-slate-950">Réinitialiser le mot de passe</h2>

        <p class="mt-2 text-sm leading-6 text-slate-600">
          Cette action va imposer un nouveau mot de passe à
          <strong>{{ fullName() }}</strong
          >. Elle doit être réservée à l’administrateur.
        </p>

        <div class="mt-5">
          <BaseInput
            v-model="form.newPassword"
            label="Nouveau mot de passe"
            type="password"
            required
            :error="errors.newPassword"
            placeholder="Minimum 6 caractères"
          />
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
            Annuler
          </BaseButton>

          <BaseButton type="button" variant="warning" :loading="loading" @click="confirm">
            Réinitialiser
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
