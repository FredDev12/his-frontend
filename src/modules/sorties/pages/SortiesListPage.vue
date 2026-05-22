<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import SortieSearchBar from '@/modules/sorties/components/SortieSearchBar.vue'
import SortieTable from '@/modules/sorties/components/SortieTable.vue'

import { useSortiesStore } from '@/modules/sorties/stores/sorties.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useSortiesStore()
const toast = useToastStore()

const sortieToValidate = ref(null)
const sortieToCancel = ref(null)
const sortieToRemove = ref(null)

const validateOpen = ref(false)
const cancelOpen = ref(false)
const removeOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 sortie'
  return `${store.pagination.total} sortie(s)`
})

onMounted(() => {
  loadSorties({ page: 1 })
})

async function loadSorties(params = {}) {
  try {
    await store.fetchSorties({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Sorties] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les sorties.')
  }
}

async function goToPage(page) {
  await loadSorties({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchSorties(filters)
  } catch (error) {
    console.error('[Sorties] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche sortie impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
    type_sortie: '',
  }

  await loadSorties({ page: 1 })
}

function askValidate(sortie) {
  sortieToValidate.value = sortie
  validateOpen.value = true
}

function closeValidate() {
  sortieToValidate.value = null
  validateOpen.value = false
}

async function confirmValidate() {
  if (!sortieToValidate.value?.id) return

  try {
    await store.validateSortie(sortieToValidate.value)
    closeValidate()
    await loadSorties({ page: store.pagination.page })
  } catch (error) {
    console.error('[Sorties] Validation impossible:', error)
  }
}

function askCancel(sortie) {
  sortieToCancel.value = sortie
  cancelOpen.value = true
}

function closeCancel() {
  sortieToCancel.value = null
  cancelOpen.value = false
}

async function confirmCancel() {
  if (!sortieToCancel.value?.id) return

  try {
    await store.cancelSortie(sortieToCancel.value)
    closeCancel()
    await loadSorties({ page: store.pagination.page })
  } catch (error) {
    console.error('[Sorties] Annulation impossible:', error)
  }
}

function askRemove(sortie) {
  sortieToRemove.value = sortie
  removeOpen.value = true
}

function closeRemove() {
  sortieToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!sortieToRemove.value?.id) return

  try {
    await store.removeSortie(sortieToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Sorties] Suppression impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Sorties patient</h1>

        <p class="his-page-subtitle">
          Clôture du passage patient, consignes de sortie et validation finale.
        </p>
      </div>

      <RouterLink to="/sorties/create">
        <BaseButton> Nouvelle sortie </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <SortieSearchBar
        :filters="store.filters"
        :loading="store.searching"
        @search="search"
        @reset="resetSearch"
      />
    </BaseCard>

    <div
      v-if="store.error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">
          {{ totalLabel }}
        </span>
      </template>

      <SortieTable
        :sorties="store.sorties"
        :loading="store.loading"
        @validate="askValidate"
        @cancel="askCancel"
        @remove="askRemove"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton
            variant="secondary"
            :disabled="store.loading || store.pagination.page <= 1"
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
      </div>
    </BaseCard>

    <ConfirmDialog
      :open="validateOpen"
      title="Valider définitivement la sortie"
      :message="`Cette action va clôturer le passage du patient ${sortieToValidate?.nom || ''} ${sortieToValidate?.prenom || ''}. Cette action doit être auditée côté serveur.`"
      confirm-label="Valider sortie"
      cancel-label="Annuler"
      variant="success"
      :loading="store.validating"
      @cancel="closeValidate"
      @confirm="confirmValidate"
    />

    <ConfirmDialog
      :open="cancelOpen"
      title="Annuler cette sortie"
      :message="`Cette action va annuler la sortie du patient ${sortieToCancel?.nom || ''} ${sortieToCancel?.prenom || ''}.`"
      confirm-label="Annuler sortie"
      cancel-label="Retour"
      variant="warning"
      :loading="store.cancelling"
      @cancel="closeCancel"
      @confirm="confirmCancel"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer cette sortie"
      :message="`Cette action va supprimer la sortie du patient ${sortieToRemove?.nom || ''} ${sortieToRemove?.prenom || ''}.`"
      confirm-label="Supprimer sortie"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>
