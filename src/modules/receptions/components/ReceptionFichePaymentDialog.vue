<script setup>
import { computed, reactive, ref, watch } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  setting: {
    type: Object,
    default: null,
  },
  patientName: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  payment: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const submitted = ref(false)
const form = reactive({
  currency: '',
  mode: '',
  mobileMoneyProvider: '',
  payerPhone: '',
  reference: '',
})

const settingValue = computed(() => props.setting?.value || {})
const allowedCurrencies = computed(() =>
  Array.isArray(settingValue.value.allowedCurrencies)
    ? settingValue.value.allowedCurrencies
    : [],
)
const allowedPaymentModes = computed(() =>
  Array.isArray(settingValue.value.allowedPaymentModes)
    ? settingValue.value.allowedPaymentModes
    : [],
)
const cashOnlyV1 = computed(
  () =>
    allowedPaymentModes.value.length === 1 &&
    allowedPaymentModes.value[0] === 'CASH',
)
const configuredProviders = computed(() =>
  Array.isArray(settingValue.value.mobileMoneyProviders)
    ? settingValue.value.mobileMoneyProviders
    : [],
)
const allProvidersAllowed = computed(() =>
  configuredProviders.value.some((provider) => String(provider).toUpperCase() === 'ALL'),
)

const currencyOptions = computed(() =>
  allowedCurrencies.value.map((currency) => ({
    value: currency,
    label: currency,
  })),
)

const paymentModeOptions = computed(() =>
  allowedPaymentModes.value.map((mode) => ({
    value: mode,
    label: mode === 'MOBILE_MONEY' ? 'Mobile Money' : 'Espèces',
  })),
)

const providerOptions = computed(() =>
  configuredProviders.value
    .filter((provider) => String(provider).toUpperCase() !== 'ALL')
    .map((provider) => ({
      value: provider,
      label: provider,
    })),
)

const amount = computed(() => {
  const configured = Number(settingValue.value.amounts?.[form.currency])
  return Number.isFinite(configured) && configured > 0 ? configured : 0
})

const formattedAmount = computed(() => {
  if (!amount.value || !form.currency) return 'Tarif indisponible'

  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: form.currency === 'CDF' ? 0 : 2,
  }).format(amount.value)} ${form.currency}`
})

const isMobileMoney = computed(() => form.mode === 'MOBILE_MONEY')

const errors = computed(() => ({
  currency: !form.currency ? 'La devise est obligatoire.' : '',
  mode: !form.mode ? 'Le mode de paiement est obligatoire.' : '',
  mobileMoneyProvider:
    isMobileMoney.value && !form.mobileMoneyProvider.trim()
      ? 'L’opérateur Mobile Money est obligatoire.'
      : '',
  payerPhone:
    isMobileMoney.value && form.payerPhone.trim().length < 5
      ? 'Le numéro du payeur est obligatoire.'
      : '',
  reference:
    isMobileMoney.value && !form.reference.trim()
      ? 'La référence de transaction est obligatoire.'
      : '',
}))

const valid = computed(() =>
  amount.value > 0 && Object.values(errors.value).every((message) => !message),
)

function resetForm() {
  const defaultCurrency = settingValue.value.defaultCurrency
  const requestedCurrency = props.payment?.currency
  const requestedMode = props.payment?.mode

  form.currency = allowedCurrencies.value.includes(requestedCurrency)
    ? requestedCurrency
    : allowedCurrencies.value.includes(defaultCurrency)
      ? defaultCurrency
      : allowedCurrencies.value[0] || ''
  form.mode = allowedPaymentModes.value.includes(requestedMode)
    ? requestedMode
    : allowedPaymentModes.value.includes('CASH')
      ? 'CASH'
      : allowedPaymentModes.value[0] || ''
  form.mobileMoneyProvider = props.payment?.mobileMoneyProvider || (
    allProvidersAllowed.value ? '' : providerOptions.value[0]?.value || ''
  )
  form.payerPhone = props.payment?.payerPhone || ''
  form.reference = props.payment?.reference || ''
  submitted.value = false
}

watch(
  () => [props.open, props.setting],
  ([open]) => {
    if (open) resetForm()
  },
  { immediate: true },
)

watch(
  () => form.mode,
  (mode) => {
    if (mode !== 'MOBILE_MONEY') {
      form.mobileMoneyProvider = ''
      form.payerPhone = ''
      form.reference = ''
      return
    }

    if (!allProvidersAllowed.value && !form.mobileMoneyProvider) {
      form.mobileMoneyProvider = providerOptions.value[0]?.value || ''
    }
  },
)

function cancel() {
  if (!props.loading) emit('cancel')
}

function confirm() {
  submitted.value = true
  if (!valid.value) return

  const payload = {
    currency: form.currency,
    mode: form.mode,
  }

  if (isMobileMoney.value) {
    payload.mobileMoneyProvider = form.mobileMoneyProvider.trim()
    payload.payerPhone = form.payerPhone.trim()
    payload.reference = form.reference.trim()
  }

  emit('confirm', payload)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fiche-payment-title"
      @keydown.esc="cancel"
    >
      <div class="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div>
          <h2 id="fiche-payment-title" class="text-lg font-semibold text-slate-950">
            Paiement des frais d’ouverture de fiche
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Patient :
            <span class="font-semibold text-slate-900">{{ patientName || 'Nouvelle fiche publique' }}</span>
          </p>
        </div>

        <div class="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p class="text-sm font-medium text-blue-700">Tarif officiel</p>
          <p class="mt-1 text-2xl font-bold text-blue-950">{{ formattedAmount }}</p>
          <p class="mt-1 text-xs text-blue-700">
            Le montant provient des paramètres administratifs et ne peut pas être modifié ici.
          </p>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <BaseSelect
            v-model="form.currency"
            label="Devise"
            :options="currencyOptions"
            :error="submitted ? errors.currency : ''"
            required
          />

          <BaseSelect
            v-model="form.mode"
            label="Mode de paiement"
            :options="paymentModeOptions"
            :error="submitted ? errors.mode : ''"
            required
          />
        </div>

        <div
          v-if="cashOnlyV1"
          class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Version actuelle : paiement en espèces uniquement. Mobile Money sera activé ultérieurement
          depuis les paramètres administratifs.
        </div>

        <div v-if="isMobileMoney" class="mt-4 grid gap-4">
          <BaseInput
            v-if="allProvidersAllowed"
            v-model="form.mobileMoneyProvider"
            label="Opérateur Mobile Money"
            placeholder="Ex. Airtel Money, Orange Money, M-Pesa"
            :error="submitted ? errors.mobileMoneyProvider : ''"
            required
          />

          <BaseSelect
            v-else
            v-model="form.mobileMoneyProvider"
            label="Opérateur Mobile Money"
            :options="providerOptions"
            :error="submitted ? errors.mobileMoneyProvider : ''"
            required
          />

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.payerPhone"
              label="Téléphone du payeur"
              placeholder="Numéro utilisé pour la transaction"
              :error="submitted ? errors.payerPhone : ''"
              required
            />

            <BaseInput
              v-model="form.reference"
              label="Référence de transaction"
              placeholder="Référence fournie par l’opérateur"
              :error="submitted ? errors.reference : ''"
              required
            />
          </div>
        </div>

        <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          La facture, le paiement et le reçu seront créés avec la fiche, la réception et l’épisode dans une seule transaction auditée.
        </div>

        <div class="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <BaseButton variant="secondary" :disabled="loading" @click="cancel">
            Annuler
          </BaseButton>

          <BaseButton :loading="loading" @click="confirm">
            Confirmer les informations de paiement
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
