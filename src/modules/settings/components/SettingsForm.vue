<script setup>
import { reactive, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import ReferenceListEditor from '@/modules/settings/components/ReferenceListEditor.vue'

const props = defineProps({
  initialValue: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'reset'])

const form = reactive({
  general: {
    hospital_name: '',
    hospital_code: '',
    address: '',
    phone: '',
    email: '',
    default_currency: 'CDF',
    timezone: 'Africa/Kinshasa',
    language: 'fr',
  },

  workflow: {
    require_payment_before_pharmacy: true,
    require_payment_before_exit: true,
    require_audit_for_critical_actions: true,
    enable_emergency_confirmation: true,
  },

  payment_modes: [],
  laboratory_exam_types: [],
  imaging_exam_types: [],
  discharge_types: [],
})

const errors = reactive({})

const currencyOptions = [
  { label: 'Franc congolais — CDF', value: 'CDF' },
  { label: 'Dollar américain — USD', value: 'USD' },
  { label: 'Euro — EUR', value: 'EUR' },
]

const timezoneOptions = [
  { label: 'Africa/Kinshasa', value: 'Africa/Kinshasa' },
  { label: 'Africa/Lubumbashi', value: 'Africa/Lubumbashi' },
  { label: 'UTC', value: 'UTC' },
]

const languageOptions = [
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' },
]

watch(
  () => props.initialValue,
  (value) => {
    if (!value) return

    form.general = {
      ...form.general,
      ...value.general,
    }

    form.workflow = {
      ...form.workflow,
      ...value.workflow,
    }

    form.payment_modes = [...(value.payment_modes || [])]
    form.laboratory_exam_types = [...(value.laboratory_exam_types || [])]
    form.imaging_exam_types = [...(value.imaging_exam_types || [])]
    form.discharge_types = [...(value.discharge_types || [])]
  },
  { immediate: true, deep: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

function validate() {
  clearErrors()

  if (!form.general.hospital_name) {
    errors.hospital_name = 'Nom de l’hôpital obligatoire.'
  }

  if (!form.general.default_currency) {
    errors.default_currency = 'Devise obligatoire.'
  }

  if (!form.general.timezone) {
    errors.timezone = 'Fuseau horaire obligatoire.'
  }

  if (form.payment_modes.length === 0) {
    errors.payment_modes = 'Au moins un mode de paiement est obligatoire.'
  }

  return Object.values(errors).every((value) => !value)
}

function buildPayload() {
  return {
    general: {
      hospital_name: form.general.hospital_name,
      hospital_code: form.general.hospital_code,
      address: form.general.address,
      phone: form.general.phone,
      email: form.general.email,
      default_currency: form.general.default_currency,
      timezone: form.general.timezone,
      language: form.general.language,
    },

    workflow: {
      require_payment_before_pharmacy: Boolean(form.workflow.require_payment_before_pharmacy),
      require_payment_before_exit: Boolean(form.workflow.require_payment_before_exit),
      require_audit_for_critical_actions: Boolean(form.workflow.require_audit_for_critical_actions),
      enable_emergency_confirmation: Boolean(form.workflow.enable_emergency_confirmation),
    },

    payment_modes: [...form.payment_modes],
    laboratory_exam_types: [...form.laboratory_exam_types],
    imaging_exam_types: [...form.imaging_exam_types],
    discharge_types: [...form.discharge_types],
  }
}

function submit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <BaseCard
      title="Informations générales"
      subtitle="Paramètres institutionnels utilisés dans l’interface HIS."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <BaseInput
          v-model="form.general.hospital_name"
          label="Nom de l’hôpital"
          required
          :error="errors.hospital_name"
        />

        <BaseInput
          v-model="form.general.hospital_code"
          label="Code établissement"
          placeholder="CAC-HIS"
        />

        <BaseSelect
          v-model="form.general.default_currency"
          label="Devise par défaut"
          :options="currencyOptions"
          required
          :error="errors.default_currency"
        />

        <BaseSelect
          v-model="form.general.timezone"
          label="Fuseau horaire"
          :options="timezoneOptions"
          required
          :error="errors.timezone"
        />

        <BaseSelect
          v-model="form.general.language"
          label="Langue interface"
          :options="languageOptions"
        />

        <BaseInput v-model="form.general.phone" label="Téléphone" placeholder="+243..." />

        <BaseInput
          v-model="form.general.email"
          label="Email"
          type="email"
          placeholder="contact@hopital.local"
        />

        <div class="md:col-span-2 xl:col-span-3">
          <BaseTextarea
            v-model="form.general.address"
            label="Adresse"
            placeholder="Adresse complète de l’établissement..."
            :rows="3"
          />
        </div>
      </div>
    </BaseCard>

    <BaseCard
      title="Règles système"
      subtitle="Règles frontend préparées pour les contrôles métier."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <label class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            v-model="form.workflow.require_payment_before_pharmacy"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <span>
            <span class="block font-medium text-slate-900"> Paiement requis avant pharmacie </span>
            <span class="mt-1 block text-sm text-slate-500">
              Empêche la délivrance si la prescription n’est pas payée côté workflow.
            </span>
          </span>
        </label>

        <label class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            v-model="form.workflow.require_payment_before_exit"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <span>
            <span class="block font-medium text-slate-900"> Paiement requis avant sortie </span>
            <span class="mt-1 block text-sm text-slate-500">
              Prépare le contrôle avant validation de la sortie patient.
            </span>
          </span>
        </label>

        <label class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            v-model="form.workflow.require_audit_for_critical_actions"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <span>
            <span class="block font-medium text-slate-900">
              Audit obligatoire actions critiques
            </span>
            <span class="mt-1 block text-sm text-slate-500">
              Toutes les actions sensibles doivent être tracées côté backend.
            </span>
          </span>
        </label>

        <label class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            v-model="form.workflow.enable_emergency_confirmation"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <span>
            <span class="block font-medium text-slate-900"> Confirmation rapide urgences </span>
            <span class="mt-1 block text-sm text-slate-500">
              Les actions d’urgence restent distinctes et confirmées rapidement.
            </span>
          </span>
        </label>
      </div>
    </BaseCard>

    <BaseCard
      title="Référentiels système"
      subtitle="Valeurs utilisées par les formulaires des modules métier."
    >
      <div class="grid gap-4 xl:grid-cols-2">
        <ReferenceListEditor
          v-model="form.payment_modes"
          title="Modes de paiement"
          subtitle="Valeurs utilisées par le module Caisse."
          placeholder="Exemple : CASH"
        />

        <ReferenceListEditor
          v-model="form.laboratory_exam_types"
          title="Examens laboratoire"
          subtitle="Valeurs proposées dans le module Laboratoire."
          placeholder="Exemple : Goutte épaisse"
        />

        <ReferenceListEditor
          v-model="form.imaging_exam_types"
          title="Examens imagerie"
          subtitle="Valeurs proposées dans le module Imagerie."
          placeholder="Exemple : RADIOGRAPHIE"
        />

        <ReferenceListEditor
          v-model="form.discharge_types"
          title="Types de sortie"
          subtitle="Valeurs proposées dans le module Sortie patient."
          placeholder="Exemple : TRANSFERT"
        />
      </div>

      <p v-if="errors.payment_modes" class="mt-3 text-sm font-medium text-red-600">
        {{ errors.payment_modes }}
      </p>
    </BaseCard>

    <div class="flex justify-end gap-3">
      <BaseButton type="button" variant="secondary" @click="$emit('reset')">
        Réinitialiser
      </BaseButton>

      <BaseButton type="submit" :loading="loading"> Enregistrer paramètres </BaseButton>
    </div>
  </form>
</template>
