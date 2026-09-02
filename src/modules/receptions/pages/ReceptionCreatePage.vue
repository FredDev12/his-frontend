<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'
import ReceptionFichePaymentDialog from '@/modules/receptions/components/ReceptionFichePaymentDialog.vue'
import AgentSearchCard from '@/modules/agents/components/AgentSearchCard.vue'
import { useReceptionsStore } from '@/modules/receptions/stores/receptions.store'
import { receptionsService } from '@/modules/receptions/services/receptions.service'
import {
  buildReceptionCreatePayload,
  buildReceptionIdentityFingerprint,
  buildReceptionIdentityPreflightPayload,
  buildReceptionPatientSelectionPayload,
  isReceptionFichePaymentComplete,
  resolveReceptionFicheOpeningAmount,
} from '@/modules/receptions/workflow/reception-create.workflow'
import {
  activeReceptionDetailsPath,
  hasBlockingActiveReception,
} from '@/modules/receptions/workflow/reception-active.workflow'

const router = useRouter()
const store = useReceptionsStore()

const step = ref(1)
const agentVerified = ref(false)
const selectedAgentPayload = ref(null)
const activeAdmissionError = ref(null)
const preflightResult = ref(null)
const preflightError = ref(null)
const preflightFingerprint = ref('')
const preflightLoading = ref(false)
const duplicateResolution = ref(null)
const duplicateConfirmOpen = ref(false)
const fichePaymentDialogOpen = ref(false)
const fichePaymentSetting = ref(null)
const fichePaymentSettingLoading = ref(false)
const fichePaymentSettingError = ref(null)
const fichePayment = ref(null)

const steps = [
  { id: 1, label: 'Type patient' },
  { id: 2, label: 'Identification' },
  { id: 3, label: 'Orientation' },
  { id: 4, label: 'Confirmation' },
]

const form = reactive({
  patientType: 'PUBLIC',
  isAgent: false,
  agentReference: '',
  relationToAgent: '',
  spouseVerification: {
    documentType: '',
    documentReference: '',
  },

  patient: {
    id: null,
    firstName: '',
    lastName: '',
    middleName: '',
    gender: 'M',
    birthDate: '',
    estimatedAge: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  },
})

const isPublic = computed(() => form.patientType === 'PUBLIC')
const isAgentFlow = computed(() => ['AGENT_CAC', 'AYANT_DROIT'].includes(form.patientType))
const isSpouseFlow = computed(() => form.patientType === 'AYANT_DROIT')
const currentIdentityFingerprint = computed(() => buildReceptionIdentityFingerprint(form))
const preflightIsCurrent = computed(
  () => Boolean(preflightFingerprint.value) && preflightFingerprint.value === currentIdentityFingerprint.value,
)
const possibleMatches = computed(() => {
  if (!preflightIsCurrent.value || preflightResult.value?.decision !== 'POSSIBLE_DUPLICATES') {
    return []
  }

  return Array.isArray(preflightResult.value?.matches) ? preflightResult.value.matches : []
})

const duplicateCreationConfirmed = computed(() => {
  if (!preflightIsCurrent.value) return false
  if (preflightResult.value?.decision !== 'POSSIBLE_DUPLICATES') return false
  if (!duplicateResolution.value) return false

  const currentIds = [...possibleMatches.value.map((match) => String(match.id))].sort()
  const confirmedIds = [...duplicateResolution.value.candidateIds].map(String).sort()

  return (
    currentIds.length > 0 &&
    currentIds.length === confirmedIds.length &&
    currentIds.every((id, index) => id === confirmedIds[index])
  )
})

const preflightValidated = computed(() =>
  Boolean(
    preflightIsCurrent.value &&
      ((preflightResult.value?.canProceed &&
        ['EXISTING_PATIENT', 'NEW_PATIENT'].includes(preflightResult.value?.decision)) ||
        duplicateCreationConfirmed.value),
  ),
)
const existingPatientSelected = computed(
  () => preflightValidated.value && preflightResult.value?.decision === 'EXISTING_PATIENT',
)
const activeReceptionBlocking = computed(
  () => preflightIsCurrent.value && hasBlockingActiveReception(preflightResult.value),
)
const activeReceptionPath = computed(() =>
  activeReceptionDetailsPath(preflightResult.value),
)
const paymentRequired = computed(() => {
  if (!preflightValidated.value) return false
  if (duplicateCreationConfirmed.value) return form.patientType === 'PUBLIC'
  return Boolean(preflightResult.value?.paymentRequired)
})
const allowedFichePaymentModes = computed(() => {
  const modes = fichePaymentSetting.value?.value?.allowedPaymentModes
  return Array.isArray(modes) ? modes : []
})

const fichePaymentComplete = computed(
  () =>
    isReceptionFichePaymentComplete(fichePayment.value) &&
    allowedFichePaymentModes.value.includes(fichePayment.value?.mode),
)
const paymentReady = computed(() => !paymentRequired.value || fichePaymentComplete.value)
const fichePaymentAmount = computed(() =>
  resolveReceptionFicheOpeningAmount(
    fichePaymentSetting.value,
    fichePayment.value?.currency,
  ),
)
const fichePaymentAmountLabel = computed(() => {
  if (!fichePaymentAmount.value || !fichePayment.value?.currency) return '—'

  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: fichePayment.value.currency === 'CDF' ? 0 : 2,
  }).format(fichePaymentAmount.value)} ${fichePayment.value.currency}`
})
const fichePaymentModeLabel = computed(() =>
  fichePayment.value?.mode === 'MOBILE_MONEY' ? 'Mobile Money' : 'Espèces',
)

const currentPatientName = computed(() =>
  [form.patient.lastName, form.patient.middleName, form.patient.firstName]
    .filter(Boolean)
    .join(' '),
)

const typeLabel = computed(() => {
  if (form.patientType === 'AGENT_CAC') return 'Agent CAC'
  if (form.patientType === 'AYANT_DROIT') {
    return 'Ayant droit — Conjoint(e)'
  }
  return 'Public'
})

const identityReadonly = computed(
  () =>
    existingPatientSelected.value ||
    (form.patientType === 'AGENT_CAC' && agentVerified.value),
)

const administrativeDetailsReadonly = computed(() => existingPatientSelected.value)

const birthDateReadonly = computed(() => {
  if (existingPatientSelected.value) return true
  if (form.patientType !== 'AGENT_CAC' || !agentVerified.value) return false

  return Boolean(selectedAgentPayload.value?.patient?.birthDate)
})

const patientTypeValid = computed(() =>
  ['PUBLIC', 'AGENT_CAC', 'AYANT_DROIT'].includes(form.patientType),
)

const identityValid = computed(() => {
  if (isAgentFlow.value && !agentVerified.value) return false

  if (isSpouseFlow.value && !form.patient.birthDate) return false

  return Boolean(
    form.patient.firstName.trim().length >= 2 &&
      form.patient.lastName.trim().length >= 2 &&
      form.patient.gender &&
      (form.patient.birthDate || Number(form.patient.estimatedAge) > 0),
  )
})

const canGoNext = computed(() => {
  if (step.value === 1) return patientTypeValid.value
  if (step.value === 2) return identityValid.value && !activeReceptionBlocking.value
  if (step.value === 3) {
    return (
      patientTypeValid.value &&
      identityValid.value &&
      preflightValidated.value &&
      paymentReady.value
    )
  }

  return true
})

const canSubmit = computed(
  () =>
    patientTypeValid.value &&
    identityValid.value &&
    preflightValidated.value &&
    paymentReady.value,
)

const nextButtonLabel = computed(() => {
  if (step.value === 2 && activeReceptionBlocking.value) {
    return 'Réception déjà active'
  }

  if (step.value === 2 && !preflightValidated.value) {
    return 'Vérifier et continuer'
  }

  return 'Suivant'
})

const paymentTitle = computed(() => {
  if (paymentRequired.value && fichePaymentComplete.value) return 'Paiement renseigné'
  if (paymentRequired.value) return 'Frais d’ouverture de fiche obligatoires'
  if (existingPatientSelected.value) return 'Fiche existante — aucun frais d’ouverture'
  return 'Prise en charge CAC'
})

const paymentDescription = computed(() => {
  if (paymentRequired.value && fichePaymentComplete.value) {
    return `${fichePaymentAmountLabel.value} · ${fichePaymentModeLabel.value}`
  }

  if (paymentRequired.value) {
    return 'Le paiement doit être renseigné avant de poursuivre vers la confirmation.'
  }

  if (existingPatientSelected.value) {
    return 'La fiche personnelle est réutilisée. Seule une nouvelle visite sera créée.'
  }

  return 'Aucun paiement d’ouverture de fiche n’est requis.'
})

function calculateAgeFromBirthDate(birthDate) {
  if (!birthDate) return ''

  const birth = new Date(birthDate)
  const today = new Date()

  if (Number.isNaN(birth.getTime())) return ''

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age >= 0 ? String(age) : ''
}

watch(
  () => form.patient.birthDate,
  (birthDate) => {
    const age = calculateAgeFromBirthDate(birthDate)

    if (age) {
      form.patient.estimatedAge = age
    }
  },
)

function resetFichePayment() {
  fichePayment.value = null
  fichePaymentDialogOpen.value = false
  fichePaymentSettingError.value = null
}

function resetPreflight() {
  preflightResult.value = null
  preflightError.value = null
  preflightFingerprint.value = ''
  activeAdmissionError.value = null
  duplicateResolution.value = null
  duplicateConfirmOpen.value = false
  form.patient.id = null
  resetFichePayment()
}

function resetAgentState() {
  agentVerified.value = false
  selectedAgentPayload.value = null
  form.agentReference = ''
  form.relationToAgent = ''
  form.spouseVerification.documentType = ''
  form.spouseVerification.documentReference = ''
}

function resetPatient() {
  form.patient.id = null
  form.patient.firstName = ''
  form.patient.lastName = ''
  form.patient.middleName = ''
  form.patient.gender = 'M'
  form.patient.birthDate = ''
  form.patient.estimatedAge = ''
  form.patient.phone = ''
  form.patient.address = ''
  form.patient.emergencyContactName = ''
  form.patient.emergencyContactPhone = ''
}

function selectPatientType(type) {
  form.patientType = type
  resetPreflight()
  resetAgentState()
  resetPatient()

  if (type === 'PUBLIC') {
    form.isAgent = false
    agentVerified.value = true
  }

  if (type === 'AGENT_CAC') {
    form.isAgent = true
    form.relationToAgent = 'SELF'
    agentVerified.value = false
  }

  if (type === 'AYANT_DROIT') {
    form.isAgent = false
    form.relationToAgent = 'SPOUSE'
    agentVerified.value = false
  }
}

function normalizeApiError(error, fallback) {
  return {
    code: error?.code || error?.response?.data?.code || 'RECEPTION_PREFLIGHT_FAILED',
    message:
      error?.message ||
      error?.response?.data?.message ||
      fallback,
  }
}

function preflightBlockMessage(result) {
  if (result?.blockReason === 'PATIENT_ARCHIVED') {
    return 'Cette fiche patient est archivée. Sa réactivation doit être autorisée avant une nouvelle admission.'
  }

  if (result?.blockReason === 'ACTIVE_RECEPTION_ALREADY_EXISTS') {
    const code = result?.activeReception?.receptionCode || 'réception en cours'
    return `Une réception est déjà active pour ce patient (${code}). Ouvrez-la avant toute nouvelle admission.`
  }

  return null
}

function applyPatientSummary(patient) {
  if (!patient) return

  form.patient.id = patient.id || null
  form.patient.firstName = patient.firstName || ''
  form.patient.lastName = patient.lastName || ''
  form.patient.middleName = patient.middleName || ''
  form.patient.gender = patient.gender || 'M'
  form.patient.birthDate = patient.birthDate || ''
  form.patient.estimatedAge = patient.estimatedAge ? String(patient.estimatedAge) : ''
  form.patient.phone = patient.phone || ''
}

function applyPreflightResult(result) {
  preflightResult.value = result
  preflightError.value = null
  activeAdmissionError.value = null
  duplicateResolution.value = null
  duplicateConfirmOpen.value = false

  if (result?.decision === 'EXISTING_PATIENT' && result.patient) {
    applyPatientSummary(result.patient)
  } else {
    form.patient.id = null
  }

  const blockMessage = preflightBlockMessage(result)
  if (blockMessage) {
    activeAdmissionError.value = {
      code: result.blockReason,
      message: blockMessage,
    }
  }

  preflightFingerprint.value = currentIdentityFingerprint.value
}

async function runIdentityPreflight() {
  if (!identityValid.value || preflightLoading.value) return false

  preflightLoading.value = true
  preflightError.value = null
  activeAdmissionError.value = null
  duplicateResolution.value = null
  duplicateConfirmOpen.value = false
  form.patient.id = null
  resetFichePayment()

  try {
    const result = await receptionsService.preflight(
      buildReceptionIdentityPreflightPayload(form),
    )

    applyPreflightResult(result)
    return Boolean(result?.canProceed)
  } catch (error) {
    preflightError.value = normalizeApiError(
      error,
      'La vérification de la fiche patient a échoué.',
    )
    preflightResult.value = null
    preflightFingerprint.value = ''
    return false
  } finally {
    preflightLoading.value = false
  }
}

async function selectExistingMatch(match) {
  if (!match?.id || preflightLoading.value) return

  preflightLoading.value = true
  preflightError.value = null
  activeAdmissionError.value = null

  try {
    const result = await receptionsService.preflight(
      buildReceptionPatientSelectionPayload(form, match.id),
    )

    applyPreflightResult(result)

    if (result?.decision === 'EXISTING_PATIENT' && result?.canProceed) {
      step.value = 3
    }
  } catch (error) {
    preflightError.value = normalizeApiError(
      error,
      'La sélection de cette fiche patient a échoué.',
    )
  } finally {
    preflightLoading.value = false
  }
}

function openDuplicateConfirmation() {
  if (!possibleMatches.value.length || preflightLoading.value) return
  duplicateConfirmOpen.value = true
}

function closeDuplicateConfirmation() {
  if (!preflightLoading.value) duplicateConfirmOpen.value = false
}

function confirmNoMatchingPatient() {
  const candidateIds = possibleMatches.value.map((match) => String(match.id))
  if (!candidateIds.length) return

  duplicateResolution.value = {
    action: 'CREATE_NEW',
    confirmation: 'AUCUNE_CORRESPONDANCE',
    candidateIds,
  }
  duplicateConfirmOpen.value = false
  activeAdmissionError.value = null
  step.value = 3
}

function restartIdentityVerification() {
  resetPreflight()
}

function openActiveReception() {
  if (!activeReceptionPath.value) return
  router.push(activeReceptionPath.value)
}

async function openFichePaymentDialog() {
  if (!paymentRequired.value || fichePaymentSettingLoading.value) return

  fichePaymentSettingError.value = null

  if (!fichePaymentSetting.value) {
    fichePaymentSettingLoading.value = true

    try {
      fichePaymentSetting.value = await receptionsService.getFicheOpeningFeeSetting()
    } catch (error) {
      fichePaymentSettingError.value = normalizeApiError(
        error,
        'Impossible de charger le tarif des frais d’ouverture de fiche.',
      )
      return
    } finally {
      fichePaymentSettingLoading.value = false
    }
  }

  fichePaymentDialogOpen.value = true
}

function closeFichePaymentDialog() {
  if (!store.saving) fichePaymentDialogOpen.value = false
}

function confirmFichePayment(payment) {
  if (!isReceptionFichePaymentComplete(payment)) return
  fichePayment.value = payment
  fichePaymentSettingError.value = null
  fichePaymentDialogOpen.value = false
}

function onAgentSelectionCleared() {
  resetPreflight()
  resetAgentState()
  resetPatient()

  if (form.patientType === 'AGENT_CAC') {
    form.isAgent = true
    form.relationToAgent = 'SELF'
  } else if (form.patientType === 'AYANT_DROIT') {
    form.isAgent = false
    form.relationToAgent = 'SPOUSE'
  }
}

async function onAgentSelected(payload) {
  resetPreflight()
  agentVerified.value = false
  selectedAgentPayload.value = payload

  form.agentReference = payload.agent?.cac_id_co || payload.agent?.matricule || ''
  form.relationToAgent = payload.relationship || ''
  form.spouseVerification.documentType =
    payload.spouseVerification?.documentType || ''
  form.spouseVerification.documentReference =
    payload.spouseVerification?.documentReference || ''

  form.patient.firstName = payload.patient?.firstName || ''
  form.patient.lastName = payload.patient?.lastName || ''
  form.patient.middleName = payload.patient?.middleName || ''
  form.patient.gender = payload.patient?.gender || ''
  form.patient.birthDate = payload.patient?.birthDate || ''
  form.patient.estimatedAge = payload.patient?.estimatedAge ? String(payload.patient.estimatedAge) : ''
  form.patient.phone = payload.patient?.phone || ''
  form.patient.address = payload.patient?.address || ''

  agentVerified.value = true

  if (identityValid.value) {
    await runIdentityPreflight()
  }
}

async function nextStep() {
  if (!canGoNext.value) return

  if (step.value === 2 && !preflightValidated.value) {
    const canProceed = await runIdentityPreflight()
    if (!canProceed || !preflightValidated.value) return
  }

  step.value = Math.min(step.value + 1, steps.length)
}

function previousStep() {
  step.value = Math.max(step.value - 1, 1)
}

function formatBirthDate(value) {
  if (!value) return 'Date inconnue'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR').format(date)
}

function patientFullName(patient) {
  return [patient?.lastName, patient?.middleName, patient?.firstName]
    .filter(Boolean)
    .join(' ')
}

function buildPayload() {
  return buildReceptionCreatePayload(
    form,
    preflightResult.value,
    duplicateResolution.value,
    fichePayment.value,
  )
}

async function submit() {
  if (!canSubmit.value) return

  activeAdmissionError.value = null

  try {
    const created = await store.createReception(buildPayload())

    if (created?.id) {
      router.push(`/receptions/${created.id}`)
      return
    }

    router.push('/receptions')
  } catch (error) {
    const normalized = normalizeApiError(
      error,
      'Création de la réception impossible.',
    )

    activeAdmissionError.value = normalized

    if (normalized.code === 'ACTIVE_RECEPTION_ALREADY_EXISTS') {
      step.value = 2
      await runIdentityPreflight()
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Nouvelle réception</h1>
        <p class="his-page-subtitle">
          Recherche obligatoire de la fiche personnelle, admission administrative et orientation vers le triage.
        </p>
      </div>

      <BaseButton variant="secondary" @click="router.push('/receptions')">
        Retour liste
      </BaseButton>
    </header>

    <BaseCard>
      <div class="grid gap-3 md:grid-cols-4">
        <div
          v-for="item in steps"
          :key="item.id"
          class="rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition"
          :class="
            step === item.id
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : step > item.id
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-500'
          "
          :aria-current="step === item.id ? 'step' : undefined"
        >
          <span class="block text-xs">Étape {{ item.id }}</span>
          {{ item.label }}
        </div>
      </div>
    </BaseCard>

    <BaseCard v-if="step === 1">
      <h2 class="text-lg font-semibold text-slate-950">Type de patient</h2>
      <p class="mt-1 text-sm text-slate-500">
        La fiche patient est unique. Son existence sera vérifiée avant toute nouvelle création.
      </p>

      <div class="mt-5 grid gap-4 md:grid-cols-3">
        <button
          type="button"
          class="rounded-2xl border p-5 text-left"
          :class="form.patientType === 'PUBLIC' ? 'border-blue-300 bg-blue-50' : 'border-slate-200'"
          @click="selectPatientType('PUBLIC')"
        >
          <p class="font-semibold text-slate-950">Patient public</p>
          <p class="mt-1 text-sm text-slate-500">
            Recherche obligatoire. Paiement uniquement si aucune fiche personnelle n’existe.
          </p>
        </button>

        <button
          type="button"
          class="rounded-2xl border p-5 text-left"
          :class="form.patientType === 'AGENT_CAC' ? 'border-blue-300 bg-blue-50' : 'border-slate-200'"
          @click="selectPatientType('AGENT_CAC')"
        >
          <p class="font-semibold text-slate-950">Agent CAC</p>
          <p class="mt-1 text-sm text-slate-500">Recherche obligatoire dans le registre agent et les fiches patients.</p>
        </button>

        <button
          type="button"
          class="rounded-2xl border p-5 text-left"
          :class="form.patientType === 'AYANT_DROIT' ? 'border-blue-300 bg-blue-50' : 'border-slate-200'"
          @click="selectPatientType('AYANT_DROIT')"
        >
          <p class="font-semibold text-slate-950">Conjoint(e) d’un agent</p>
          <p class="mt-1 text-sm text-slate-500">
            Conjoint(e) uniquement pour la V1. Enfants et parents prévus dans une mise à jour.
          </p>
        </button>
      </div>
    </BaseCard>

    <BaseCard v-if="step === 2">
      <AgentSearchCard
        v-if="isAgentFlow"
        :patient-type="form.patientType"
        @selected="onAgentSelected"
        @cleared="onAgentSelectionCleared"
      />

      <div v-if="agentVerified" class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        {{
          isSpouseFlow
            ? 'Rattachement administratif du conjoint confirmé.'
            : `Identité administrative confirmée : ${typeLabel}.`
        }}
      </div>

      <div
        v-if="isSpouseFlow && agentVerified"
        class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800"
      >
        Saisissez l’identité du conjoint exactement comme sur le justificatif présenté.
        Le nom, le postnom et le prénom doivent reprendre tous les éléments de
        <strong>{{ selectedAgentPayload?.declaredSpouseName }}</strong>.
        La date de naissance exacte est obligatoire.
      </div>

      <div v-if="isPublic || agentVerified" class="mt-6">
        <h2 class="text-lg font-semibold text-slate-950">Informations patient</h2>

        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Nom</span>
            <input v-model="form.patient.lastName" :readonly="identityReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus disabled:bg-slate-100" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Postnom</span>
            <input v-model="form.patient.middleName" :readonly="identityReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Prénom</span>
            <input v-model="form.patient.firstName" :readonly="identityReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Sexe</span>
            <select v-model="form.patient.gender" :disabled="identityReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus">
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Date de naissance</span>
            <input v-model="form.patient.birthDate" :readonly="birthDateReadonly" type="date" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Âge estimé</span>
            <input v-model="form.patient.estimatedAge" :readonly="Boolean(form.patient.birthDate) || birthDateReadonly" type="number" min="0" max="130" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Téléphone</span>
            <input v-model="form.patient.phone" :readonly="administrativeDetailsReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>

          <label class="block md:col-span-2">
            <span class="text-sm font-medium text-slate-700">Adresse / Site</span>
            <input v-model="form.patient.address" :readonly="administrativeDetailsReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Contact urgence</span>
            <input v-model="form.patient.emergencyContactName" :readonly="administrativeDetailsReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Téléphone urgence</span>
            <input v-model="form.patient.emergencyContactPhone" :readonly="administrativeDetailsReadonly" class="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm his-focus" />
          </label>
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h3 class="font-semibold text-slate-950">Vérification de la fiche personnelle</h3>
              <p class="mt-1 text-sm text-slate-600">
                Cette recherche est obligatoire avant le paiement ou la création d’une nouvelle fiche.
              </p>
            </div>

            <BaseButton
              v-if="!existingPatientSelected"
              :loading="preflightLoading"
              :disabled="!identityValid"
              @click="runIdentityPreflight"
            >
              Vérifier la fiche
            </BaseButton>

            <BaseButton
              v-else
              variant="secondary"
              :disabled="preflightLoading"
              @click="restartIdentityVerification"
            >
              Reprendre la recherche
            </BaseButton>
          </div>

          <div
            v-if="preflightResult && !preflightIsCurrent"
            class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            L’identité a été modifiée après la vérification. Une nouvelle recherche est obligatoire.
          </div>

          <div
            v-if="preflightError"
            class="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {{ preflightError.message }}
          </div>

          <div
            v-if="activeAdmissionError && preflightIsCurrent"
            class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p class="font-semibold text-red-900">Admission impossible</p>
            <p class="mt-1">{{ activeAdmissionError.message }}</p>
            <BaseButton
              v-if="activeReceptionBlocking && activeReceptionPath"
              class="mt-3"
              variant="secondary"
              @click="openActiveReception"
            >
              Ouvrir la réception en cours
            </BaseButton>
          </div>

          <div
            v-if="preflightIsCurrent && preflightResult?.decision === 'EXISTING_PATIENT' && (preflightResult.activeEpisode || preflightResult.activeReception)"
            class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
          >
            <p class="font-semibold text-blue-900">Historique de passage détecté</p>
            <p v-if="preflightResult.activeEpisode" class="mt-1">
              Épisode précédent encore ouvert : {{ preflightResult.activeEpisode.episodeCode }}
              ({{ preflightResult.activeEpisode.status }}).
            </p>
            <p v-if="preflightResult.activeReception" class="mt-1">
              Réception précédente : {{ preflightResult.activeReception.receptionCode }}
              ({{ preflightResult.activeReception.status }}).
            </p>
            <p v-if="activeReceptionBlocking" class="mt-2 text-xs text-blue-700">
              La réception en cours doit être poursuivie ou annulée avant d’ouvrir un nouveau passage.
            </p>
            <p v-else class="mt-2 text-xs text-blue-700">
              Un ancien épisode sans réception active ne bloque pas une nouvelle visite.
            </p>
          </div>

          <div
            v-if="preflightIsCurrent && preflightResult?.decision === 'EXISTING_PATIENT'"
            class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <p class="font-semibold text-emerald-900">Fiche existante sélectionnée</p>
            <p class="mt-1">
              {{ preflightResult.patient.patientCode }} — {{ patientFullName(preflightResult.patient) }}
            </p>
            <p v-if="activeReceptionBlocking" class="mt-1 text-xs text-emerald-700">
              La fiche ne sera pas recréée, mais aucune nouvelle réception ne peut être ouverte tant que la réception actuelle reste active.
            </p>
            <p v-else class="mt-1 text-xs text-emerald-700">
              La fiche ne sera pas recréée. Une nouvelle visite et un nouvel épisode y seront ajoutés.
            </p>
          </div>

          <div
            v-if="preflightIsCurrent && (preflightResult?.decision === 'NEW_PATIENT' || duplicateCreationConfirmed)"
            class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
          >
            <p class="font-semibold text-blue-900">Nouvelle fiche confirmée</p>
            <p class="mt-1">
              {{ duplicateCreationConfirmed
                ? 'Le réceptionniste a confirmé qu’aucune des fiches proposées ne correspond à cette personne.'
                : 'Aucune fiche existante correspondant à cette identité n’a été trouvée.' }}
            </p>
            <p v-if="paymentRequired" class="mt-1 text-xs text-blue-700">
              Pour ce patient public, les frais d’ouverture devront être payés avant la création.
            </p>
          </div>

          <div v-if="possibleMatches.length && !duplicateCreationConfirmed" class="mt-4">
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p class="font-semibold text-amber-900">Correspondances possibles détectées</p>
              <p class="mt-1">
                La création et le paiement restent bloqués jusqu’à la sélection de la bonne fiche.
              </p>
            </div>

            <div class="mt-3 grid gap-3 lg:grid-cols-2">
              <article
                v-for="match in possibleMatches"
                :key="match.id"
                class="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p class="font-semibold text-slate-950">{{ patientFullName(match) }}</p>
                <dl class="mt-2 space-y-1 text-sm text-slate-600">
                  <div class="flex justify-between gap-3">
                    <dt>Numéro patient</dt>
                    <dd class="font-medium text-slate-900">{{ match.patientCode }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt>Naissance</dt>
                    <dd class="font-medium text-slate-900">{{ formatBirthDate(match.birthDate) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt>Téléphone</dt>
                    <dd class="font-medium text-slate-900">{{ match.phone || '—' }}</dd>
                  </div>
                </dl>

                <BaseButton
                  class="mt-4 w-full"
                  variant="secondary"
                  :loading="preflightLoading"
                  @click="selectExistingMatch(match)"
                >
                  Utiliser cette fiche
                </BaseButton>
              </article>
            </div>

            <div class="mt-4 flex justify-end">
              <BaseButton
                variant="warning"
                :disabled="preflightLoading"
                @click="openDuplicateConfirmation"
              >
                Aucune de ces fiches ne correspond
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard v-if="step === 3">
      <h2 class="text-lg font-semibold text-slate-950">Orientation administrative</h2>
      <p class="mt-1 text-sm text-slate-500">
        La Réception transmet automatiquement le nouvel épisode au triage. L’évaluation clinique,
        le motif médical, la priorité et le service demandé seront renseignés par l’infirmier de triage.
      </p>

      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p class="font-semibold text-blue-800">Destination : Triage</p>
          <p class="mt-1 text-sm text-blue-700">
            L’épisode sera créé avec le statut « En attente de triage ».
          </p>
        </div>

        <div
          class="rounded-2xl border p-4"
          :class="paymentRequired && !fichePaymentComplete ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'"
        >
          <p
            class="font-semibold"
            :class="paymentRequired && !fichePaymentComplete ? 'text-amber-800' : 'text-emerald-800'"
          >
            {{ paymentTitle }}
          </p>
          <p
            class="mt-1 text-sm"
            :class="paymentRequired && !fichePaymentComplete ? 'text-amber-700' : 'text-emerald-700'"
          >
            {{ paymentDescription }}
          </p>

          <div v-if="paymentRequired" class="mt-4">
            <BaseButton
              :variant="fichePaymentComplete ? 'secondary' : 'primary'"
              :loading="fichePaymentSettingLoading"
              :disabled="fichePaymentSettingLoading"
              @click="openFichePaymentDialog"
            >
              {{ fichePaymentComplete ? 'Modifier le paiement' : 'Renseigner le paiement' }}
            </BaseButton>

            <p
              v-if="fichePaymentSettingError"
              class="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {{ fichePaymentSettingError.message }}
            </p>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard v-if="step === 4">
      <div
        v-if="activeAdmissionError"
        class="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      >
        <p class="font-semibold text-amber-900">Impossible de créer cette réception</p>
        <p class="mt-1">{{ activeAdmissionError.message }}</p>
      </div>

      <div
        v-if="paymentRequired && fichePaymentComplete"
        class="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
      >
        <p class="font-semibold text-emerald-900">Paiement prêt à être enregistré</p>
        <p class="mt-1">
          {{ fichePaymentAmountLabel }} · {{ fichePaymentModeLabel }}.
          La facture, le paiement et le reçu seront créés dans la transaction d’admission.
        </p>
      </div>

      <h2 class="text-lg font-semibold text-slate-950">Confirmation</h2>

      <dl class="mt-5 grid gap-4 text-sm md:grid-cols-2">
        <div><dt class="text-slate-500">Type</dt><dd class="font-semibold text-slate-950">{{ typeLabel }}</dd></div>
        <div><dt class="text-slate-500">Matricule agent</dt><dd class="font-semibold text-slate-950">{{ form.agentReference || '—' }}</dd></div>
        <div v-if="isSpouseFlow"><dt class="text-slate-500">Relation</dt><dd class="font-semibold text-slate-950">Conjoint(e)</dd></div>
        <div><dt class="text-slate-500">Patient</dt><dd class="font-semibold text-slate-950">{{ form.patient.lastName }} {{ form.patient.middleName }} {{ form.patient.firstName }}</dd></div>
        <div v-if="isSpouseFlow"><dt class="text-slate-500">Justificatif</dt><dd class="font-semibold text-slate-950">{{ form.spouseVerification.documentReference || '—' }}</dd></div>
        <div><dt class="text-slate-500">Âge</dt><dd class="font-semibold text-slate-950">{{ form.patient.estimatedAge || '—' }}</dd></div>
        <div><dt class="text-slate-500">Fiche patient</dt><dd class="font-semibold text-slate-950">{{ existingPatientSelected ? `Existante — ${preflightResult.patient.patientCode}` : 'Nouvelle' }}</dd></div>
        <div><dt class="text-slate-500">Orientation</dt><dd class="font-semibold text-slate-950">Triage</dd></div>
        <div><dt class="text-slate-500">Statut suivant</dt><dd class="font-semibold text-slate-950">En attente de triage</dd></div>
        <div><dt class="text-slate-500">Frais d’ouverture</dt><dd class="font-semibold text-slate-950">{{ paymentRequired ? fichePaymentAmountLabel : 'Non requis' }}</dd></div>
        <div v-if="paymentRequired"><dt class="text-slate-500">Mode de paiement</dt><dd class="font-semibold text-slate-950">{{ fichePaymentModeLabel }}</dd></div>
      </dl>
    </BaseCard>

    <div class="flex flex-col-reverse justify-between gap-3 sm:flex-row">
      <BaseButton variant="secondary" :disabled="step === 1 || store.saving || preflightLoading" @click="previousStep">
        Précédent
      </BaseButton>

      <div class="flex gap-2">
        <BaseButton
          v-if="step < steps.length"
          :loading="step === 2 && preflightLoading"
          :disabled="!canGoNext || preflightLoading"
          @click="nextStep"
        >
          {{ nextButtonLabel }}
        </BaseButton>

        <BaseButton v-else :loading="store.saving" :disabled="!canSubmit" @click="submit">
          {{ paymentRequired ? 'Créer la fiche, la réception et l’épisode' : 'Créer la réception et l’épisode' }}
        </BaseButton>
      </div>
    </div>

    <ReceptionFichePaymentDialog
      :open="fichePaymentDialogOpen"
      :setting="fichePaymentSetting"
      :patient-name="currentPatientName"
      :loading="store.saving"
      :payment="fichePayment"
      @cancel="closeFichePaymentDialog"
      @confirm="confirmFichePayment"
    />

    <ConfirmDialog
      :open="duplicateConfirmOpen"
      title="Créer une nouvelle fiche malgré les correspondances"
      message="Confirmez que vous avez vérifié chaque fiche proposée et qu’aucune ne correspond à la personne présente."
      :patient-name="currentPatientName"
      patient-id="Nouvelle fiche"
      consequence="Une nouvelle fiche personnelle sera créée et cette dérogation sera enregistrée dans le journal d’audit."
      confirm-text="Confirmer la nouvelle fiche"
      require-text="CONFIRMER"
      variant="warning"
      @close="closeDuplicateConfirmation"
      @confirm="confirmNoMatchingPatient"
    />
  </div>
</template>
