<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import TriageForm from '@/modules/triage/components/TriageForm.vue'
import { useTriageStore } from '@/modules/triage/stores/triage.store'
import {
  isEmergencyTriagePriority,
  isVitalTriagePriority,
  triagePatientFullName,
} from '@/modules/triage/workflow/triage-create.workflow'

import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useTriageStore()
const toast = useToastStore()

const serverError = ref('')
const confirmOpen = ref(false)
const pendingPayload = ref(null)

const episodeId = computed(() => String(route.query.episodeId || ''))
const queueItem = computed(() => store.selectedQueueItem)

const patientName = computed(() =>
  triagePatientFullName(queueItem.value),
)

const vitalEmergency = computed(() =>
  isVitalTriagePriority(pendingPayload.value?.priority),
)

const confirmVariant = computed(() =>
  isEmergencyTriagePriority(pendingPayload.value?.priority)
    ? 'emergency'
    : 'success',
)

const confirmTitle = computed(() =>
  vitalEmergency.value
    ? 'Activer immédiatement l’urgence vitale'
    : 'Valider définitivement le triage',
)

const confirmMessage = computed(() =>
  vitalEmergency.value
    ? 'Vérifiez l’identité et les constantes. Le patient sera orienté immédiatement vers le service Urgences.'
    : 'Vérifiez l’identité, les constantes, la priorité et le service d’orientation.',
)

const confirmConsequence = computed(() =>
  vitalEmergency.value
    ? 'Cette action active un parcours d’urgence vitale, force une consultation immédiate au service Urgences et crée un audit critique.'
    : 'La validation créera le triage, modifiera le statut de l’épisode et transmettra le patient vers la consultation ou le rendez-vous.',
)

onMounted(async () => {
  if (!episodeId.value) {
    toast.error('Sélectionnez d’abord un patient dans la file du triage.')
    router.replace('/triage')
    return
  }

  try {
    await Promise.all([
      store.fetchQueueItem(episodeId.value),
      store.fetchAvailableServices(),
    ])
  } catch (error) {
    toast.error(
      error.message ||
        'Cet épisode n’est plus disponible dans la file du triage.',
    )
    router.replace('/triage')
  }
})

function askConfirmation(payload) {
  pendingPayload.value = payload
  confirmOpen.value = true
}

function closeConfirmation() {
  if (store.saving) return

  confirmOpen.value = false
  pendingPayload.value = null
}

async function confirmSubmit() {
  if (!pendingPayload.value) return

  serverError.value = ''

  try {
    const payload = vitalEmergency.value
      ? {
          ...pendingPayload.value,
          vitalEmergencyConfirmed: true,
        }
      : pendingPayload.value

    const created = await store.createTriage(payload)
    store.removeQueueItem(episodeId.value)
    closeConfirmation()

    if (created?.id) {
      router.push(`/triage/${created.id}`)
      return
    }

    router.push('/triage')
  } catch (error) {
    serverError.value =
      error.message ||
      error.response?.data?.message ||
      'Validation du triage impossible.'

    if (
      ['TRIAGE_QUEUE_ITEM_NOT_FOUND', 'TRIAGE_ALREADY_EXISTS'].includes(
        error.code,
      )
    ) {
      router.replace('/triage')
    }
  }
}

function cancel() {
  router.push('/triage')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Évaluation infirmière</h1>

      <p class="his-page-subtitle">
        Constantes vitales, priorité clinique et orientation du patient sélectionné.
      </p>
    </header>

    <div
      v-if="serverError"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ serverError }}
    </div>

    <div
      v-if="store.queueItemLoading || store.servicesLoading"
      class="his-card p-8 text-center text-sm text-slate-500"
    >
      Chargement du patient et des services...
    </div>

    <TriageForm
      v-else-if="queueItem"
      :queue-item="queueItem"
      :services="store.availableServices"
      :loading="store.saving"
      @submit="askConfirmation"
      @cancel="cancel"
    />

    <ConfirmDialog
      :open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :patient-name="patientName"
      :patient-id="queueItem?.patient?.patientCode"
      :consequence="confirmConsequence"
      :confirm-text="
        vitalEmergency
          ? 'Activer immédiatement'
          : 'Valider et orienter'
      "
      :require-text="vitalEmergency ? '' : 'CONFIRMER'"
      :variant="confirmVariant"
      :loading="store.saving"
      @close="closeConfirmation"
      @confirm="confirmSubmit"
    />
  </div>
</template>
