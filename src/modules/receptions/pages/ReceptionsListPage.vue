<script setup>
import { computed, onActivated, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import ReceptionSearchBar from '@/modules/receptions/components/ReceptionSearchBar.vue'
import ReceptionTable from '@/modules/receptions/components/ReceptionTable.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useReceptionsStore } from '@/modules/receptions/stores/receptions.store'
import { useToastStore } from '@/shared/stores/toast.store'

const router = useRouter()
const auth = useAuthStore()
const store = useReceptionsStore()
const toast = useToastStore()

const receptionToCancel = ref(null)
const cancellationReason = ref('')

const confirmCancelOpen = ref(false)

const totalLabel = computed(() => {
  const total = Number(store.pagination.total || 0)
  return total <= 1 ? `${total} réception` : `${total} réceptions`
})

const cancellationPatientName = computed(() => {
  const reception = receptionToCancel.value
  if (!reception) return ''

  return [reception.nom, reception.postnom, reception.prenom]
    .filter(Boolean)
    .join(' ')
    .trim()
})

const cancellationPatientId = computed(
  () =>
    receptionToCancel.value?.patientCode ||
    receptionToCancel.value?.numero_patient ||
    'Non renseigné',
)

onMounted(() => {
  loadReceptions({ page: 1 })
})

onActivated(() => {
  loadReceptions({
    page: store.pagination.page || 1,
    limite: store.pagination.limite,
  })
})

async function loadReceptions(params = {}) {
  try {
    await store.fetchReceptions({
      page: params.page ?? 1,
      limite: params.limite ?? store.pagination.limite,
    })
  } catch (error) {
    console.error('[Réceptions] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les réceptions.')
  }
}

async function goToPage(page) {
  try {
    await store.changePage(page)
  } catch (error) {
    console.error('[Réceptions] Erreur pagination:', error)
    toast.error(error.response?.data?.message || 'Impossible de changer de page.')
  }
}

async function search(filters) {
  try {
    await store.searchReceptions(filters)
  } catch (error) {
    console.error('[Réceptions] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'La recherche a échoué.')
  }
}

async function resetSearch() {
  try {
    await store.resetSearch()
  } catch (error) {
    console.error('[Réceptions] Erreur réinitialisation:', error)
    toast.error(error.response?.data?.message || 'Impossible de réinitialiser les filtres.')
  }
}

function viewReception(reception) {
  if (!reception?.id) return
  router.push({ name: 'receptions.details', params: { id: reception.id } })
}

function askCancel(reception) {
  receptionToCancel.value = reception
  cancellationReason.value = ''
  confirmCancelOpen.value = true
}

function closeCancel() {
  receptionToCancel.value = null
  cancellationReason.value = ''
  confirmCancelOpen.value = false
}

async function confirmCancel() {
  if (!receptionToCancel.value?.id || store.deleting) return

  try {
    await store.removeReception(
      receptionToCancel.value.id,
      cancellationReason.value.trim(),
    )
    closeCancel()
  } catch (error) {
    console.error('[Réceptions] Annulation impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Réception / Admissions</h1>

        <p class="his-page-subtitle">
          Accueil administratif, vérification de la fiche patient, frais d’ouverture et transmission au triage.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('reception:create')" to="/receptions/create">
        <BaseButton>Nouvelle réception</BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <ReceptionSearchBar
        :filters="store.filters"
        :loading="store.searching"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <ReceptionTable
        :receptions="store.receptions"
        :loading="store.loading"
        :can-view="auth.hasPermission('reception:read')"
        :can-remove="auth.hasPermission('reception:update')"
        @view="viewReception"
        @remove="askCancel"
      />

      <nav
        class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
        aria-label="Pagination des réceptions"
      >
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} sur {{ store.pagination.totalPages }}
          · {{ store.pagination.limite }} élément(s) par page
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasPrev"
            @click="goToPage(store.pagination.page - 1)"
          >
            Précédent
          </BaseButton>

          <BaseButton
            variant="secondary"
            :disabled="store.loading || !store.pagination.hasNext"
            @click="goToPage(store.pagination.page + 1)"
          >
            Suivant
          </BaseButton>
        </div>
      </nav>
    </BaseCard>


    <ConfirmDialog
      :open="confirmCancelOpen"
      title="Annuler cette réception"
      message="Cette action modifie définitivement le statut de la réception."
      :patient-name="cancellationPatientName"
      :patient-id="cancellationPatientId"
      consequence="La réception et l’épisode seront annulés. Les pièces financières déjà créées resteront conservées pour l’audit comptable et tout remboursement suivra une procédure dédiée."
      confirm-text="Confirmer l’annulation"
      require-text="CONFIRMER"
      v-model:reason="cancellationReason"
      reason-required
      reason-label="Motif d’annulation"
      reason-placeholder="Exemple : admission créée sur la mauvaise fiche patient"
      :min-reason-length="10"
      :loading="store.deleting"
      variant="warning"
      @close="closeCancel"
      @confirm="confirmCancel"
    />
  </div>
</template>

