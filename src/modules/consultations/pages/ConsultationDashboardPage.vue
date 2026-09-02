<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  RouterLink,
  useRouter,
} from 'vue-router'

import ConsultationQueueTable from '@/modules/consultations/components/ConsultationQueueTable.vue'
import {
  canStartConsultation,
  consultationStartErrorMessage,
  shouldRefreshQueueAfterStartError,
} from '@/modules/consultations/policies/consultation-start-ui.policy'
import { useConsultationQueueStore } from '@/modules/consultations/stores/consultation-queue.store'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useToastStore } from '@/shared/stores/toast.store'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

const router = useRouter()
const auth = useAuthStore()
const store = useConsultationQueueStore()
const toast = useToastStore()

const selectedItem = ref(null)

const priorityOptions = [
  {
    value: 'VITALE',
    label: 'Urgence vitale',
  },
  {
    value: 'TRES_URGENT',
    label: 'Très urgent',
  },
  {
    value: 'URGENT',
    label: 'Urgent',
  },
  {
    value: 'ROUTINE',
    label: 'Routine',
  },
]

const canStart = computed(() =>
  canStartConsultation(auth),
)

const startDialogOpen = computed(() =>
  Boolean(selectedItem.value),
)

const startLoading = computed(() => {
  const episodeId =
    selectedItem.value?.episode?.id

  return (
    Boolean(episodeId) &&
    String(store.startingEpisodeId || '') ===
      String(episodeId)
  )
})

const scopeLabel = computed(() => {
  const service = store.scope?.service

  if (!service) {
    return 'Tous les services autorisés'
  }

  return (
    `${service.name} · ` +
    `${service.site?.name || 'Site non défini'}`
  )
})

const updatedLabel = computed(() => {
  if (!store.lastUpdatedAt) {
    return 'Pas encore actualisée'
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      dateStyle: 'short',
      timeStyle: 'medium',
    },
  ).format(
    new Date(store.lastUpdatedAt),
  )
})

const startConsequence = computed(() => {
  const item = selectedItem.value

  if (!item) return ''

  return (
    `Le patient sera affecté à ${auth.fullName}, ` +
    `l’épisode ${item.episode.episodeCode} passera à ` +
    `« En consultation » dans le service ` +
    `${item.service.name}. Cette action sera auditée.`
  )
})

async function refresh() {
  try {
    await store.fetchQueue({
      page: store.pagination.page,
    })
  } catch {
    // Le store expose l’erreur normalisée.
  }
}

async function search() {
  try {
    await store.search()
  } catch {
    // Le store expose l’erreur normalisée.
  }
}

async function reset() {
  try {
    await store.resetFilters()
  } catch {
    // Le store expose l’erreur normalisée.
  }
}

async function goToPage(page) {
  try {
    await store.goToPage(page)
  } catch {
    // Le store expose l’erreur normalisée.
  }
}

function requestStart(item) {
  if (!canStart.value) return
  selectedItem.value = item
}

function closeStartDialog() {
  if (startLoading.value) return
  selectedItem.value = null
}

async function confirmStart() {
  const item = selectedItem.value

  if (!item || !canStart.value) {
    return
  }

  try {
    const consultation =
      await store.startConsultation(item)

    selectedItem.value = null

    toast.success(
      `Consultation ${consultation.consultationCode || ''} commencée pour ${item.patient.displayName}.`,
    )

    await router.push({
      name: 'consultations.details',
      params: {
        id: consultation.id,
      },
    })
  } catch (error) {
    toast.error(
      consultationStartErrorMessage(error),
    )

    if (
      shouldRefreshQueueAfterStartError(
        error,
      )
    ) {
      selectedItem.value = null
      await refresh()
    }
  }
}

onMounted(async () => {
  try {
    await store.fetchQueue({
      page: 1,
    })
  } catch {
    // Le store expose l’erreur normalisée.
  }
})
</script>

<template>
  <div class="space-y-6">
    <header
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
    >
      <div>
        <BaseBadge variant="primary">
          Service Consultation
        </BaseBadge>

        <h1 class="mt-3 his-page-title">
          File d’attente médicale
        </h1>

        <p class="his-page-subtitle">
          Patients orientés par le triage vers
          une consultation immédiate.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/consultations">
          <BaseButton variant="secondary">
            Historique
          </BaseButton>
        </RouterLink>

        <BaseButton
          variant="secondary"
          :disabled="
            store.loading ||
            Boolean(
              store.startingEpisodeId,
            )
          "
          @click="refresh"
        >
          Actualiser
        </BaseButton>
      </div>
    </header>

    <section
      class="grid gap-4 md:grid-cols-3"
    >
      <BaseCard title="Patients en attente">
        <p
          class="text-3xl font-bold text-slate-950"
        >
          {{ store.total }}
        </p>
        <p
          class="mt-1 text-sm text-slate-500"
        >
          File médicale actuelle
        </p>
      </BaseCard>

      <BaseCard title="Urgences vitales">
        <p
          class="text-3xl font-bold text-rose-700"
        >
          {{ store.vitalCount }}
        </p>
        <p
          class="mt-1 text-sm text-slate-500"
        >
          Visibles sur la page actuelle
        </p>
      </BaseCard>

      <BaseCard title="Contexte de service">
        <p
          class="font-semibold text-slate-950"
        >
          {{ scopeLabel }}
        </p>
        <p
          class="mt-1 text-sm text-slate-500"
        >
          Dernière actualisation :
          {{ updatedLabel }}
        </p>
      </BaseCard>
    </section>

    <BaseCard
      title="Rechercher dans la file"
      subtitle="Nom, code patient, épisode ou code de triage."
    >
      <form
        class="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px_auto]"
        @submit.prevent="search"
      >
        <BaseInput
          v-model="store.filters.q"
          label="Recherche"
          placeholder="Patient, PAT-, EPI- ou TRI-"
          :disabled="
            store.loading ||
            Boolean(
              store.startingEpisodeId,
            )
          "
        />

        <BaseSelect
          v-model="store.filters.priority"
          label="Priorité clinique"
          placeholder="Toutes les priorités"
          :options="priorityOptions"
          :disabled="
            store.loading ||
            Boolean(
              store.startingEpisodeId,
            )
          "
        />

        <div
          class="flex items-end gap-2"
        >
          <BaseButton
            type="submit"
            :disabled="
              store.loading ||
              Boolean(
                store.startingEpisodeId,
              )
            "
          >
            Rechercher
          </BaseButton>

          <BaseButton
            type="button"
            variant="secondary"
            :disabled="
              store.loading ||
              Boolean(
                store.startingEpisodeId,
              )
            "
            @click="reset"
          >
            Réinitialiser
          </BaseButton>
        </div>
      </form>
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      role="alert"
    >
      {{ store.error }}
    </div>

    <ConsultationQueueTable
      :items="store.items"
      :loading="store.loading"
      :can-start="canStart"
      :starting-episode-id="
        store.startingEpisodeId
      "
      @start="requestStart"
    />

    <div
      class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
    >
      <p class="text-sm text-slate-500">
        Page {{ store.pagination.page }} ·
        {{ store.pagination.count }}
        patient(s)
      </p>

      <div class="flex gap-2">
        <BaseButton
          variant="secondary"
          :disabled="
            store.loading ||
            Boolean(
              store.startingEpisodeId,
            ) ||
            !store.pagination.hasPrev
          "
          @click="
            goToPage(
              store.pagination.page - 1,
            )
          "
        >
          Précédent
        </BaseButton>

        <BaseButton
          variant="secondary"
          :disabled="
            store.loading ||
            Boolean(
              store.startingEpisodeId,
            ) ||
            !store.pagination.hasNext
          "
          @click="
            goToPage(
              store.pagination.page + 1,
            )
          "
        >
          Suivant
        </BaseButton>
      </div>
    </div>

    <div
      v-if="canStart"
      class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
    >
      Commencer une consultation exige une
      confirmation explicite. Le patient est
      ensuite affecté au médecin connecté et
      retiré immédiatement de la file.
    </div>

    <div
      v-else
      class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
    >
      Cette file est en lecture seule pour
      votre profil. Seul un médecin disposant
      de la permission de création peut
      commencer une consultation.
    </div>

    <ConfirmDialog
      :open="startDialogOpen"
      title="Commencer la consultation médicale"
      message="Vérifiez le patient, l’épisode et le service avant de confirmer la prise en charge."
      :patient-name="
        selectedItem?.patient?.displayName ||
        ''
      "
      :patient-id="
        selectedItem?.patient?.patientCode ||
        ''
      "
      :consequence="startConsequence"
      confirm-text="Commencer la consultation"
      require-text="CONFIRMER"
      variant="primary"
      :loading="startLoading"
      @close="closeStartDialog"
      @confirm="confirmStart"
    />
  </div>
</template>
