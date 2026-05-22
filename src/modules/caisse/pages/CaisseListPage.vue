<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import CaisseSearchBar from '@/modules/caisse/components/CaisseSearchBar.vue'
import CaisseTable from '@/modules/caisse/components/CaisseTable.vue'

import { useCaisseStore } from '@/modules/caisse/stores/caisse.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useCaisseStore()
const toast = useToastStore()

const paiementToValidate = ref(null)
const paiementToCancel = ref(null)
const paiementToRemove = ref(null)

const validateOpen = ref(false)
const cancelOpen = ref(false)
const removeOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 paiement'
  return `${store.pagination.total} paiement(s)`
})

onMounted(() => {
  loadPaiements({ page: 1 })
})

async function loadPaiements(params = {}) {
  try {
    await store.fetchPaiements({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Caisse] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les paiements.')
  }
}

async function goToPage(page) {
  await loadPaiements({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchPaiements(filters)
  } catch (error) {
    console.error('[Caisse] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche paiement impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
    service: '',
  }

  await loadPaiements({ page: 1 })
}

function askValidate(paiement) {
  paiementToValidate.value = paiement
  validateOpen.value = true
}

function closeValidate() {
  paiementToValidate.value = null
  validateOpen.value = false
}

async function confirmValidate() {
  if (!paiementToValidate.value?.id) return

  try {
    await store.validatePaiement(paiementToValidate.value)
    closeValidate()
    await loadPaiements({ page: store.pagination.page })
  } catch (error) {
    console.error('[Caisse] Validation impossible:', error)
  }
}

function askCancel(paiement) {
  paiementToCancel.value = paiement
  cancelOpen.value = true
}

function closeCancel() {
  paiementToCancel.value = null
  cancelOpen.value = false
}

async function confirmCancel() {
  if (!paiementToCancel.value?.id) return

  try {
    await store.cancelPaiement(paiementToCancel.value)
    closeCancel()
    await loadPaiements({ page: store.pagination.page })
  } catch (error) {
    console.error('[Caisse] Annulation impossible:', error)
  }
}

function askRemove(paiement) {
  paiementToRemove.value = paiement
  removeOpen.value = true
}

function closeRemove() {
  paiementToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!paiementToRemove.value?.id) return

  try {
    await store.removePaiement(paiementToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Caisse] Suppression impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Caisse / Paiements</h1>

        <p class="his-page-subtitle">
          Paiements hospitaliers, validation caisse, annulation et suivi des références.
        </p>
      </div>

      <RouterLink to="/caisse/create">
        <BaseButton> Nouveau paiement </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <CaisseSearchBar
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

      <CaisseTable
        :paiements="store.paiements"
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
      title="Valider ce paiement"
      :message="`Cette action va valider le paiement de ${paiementToValidate?.montant || ''} ${paiementToValidate?.devise || ''}. Cette action doit être auditée côté serveur.`"
      confirm-label="Valider paiement"
      cancel-label="Annuler"
      variant="success"
      :loading="store.validating"
      @cancel="closeValidate"
      @confirm="confirmValidate"
    />

    <ConfirmDialog
      :open="cancelOpen"
      title="Annuler ce paiement"
      :message="`Cette action va annuler le paiement de ${paiementToCancel?.montant || ''} ${paiementToCancel?.devise || ''}. Cette action est sensible et doit être auditée.`"
      confirm-label="Annuler paiement"
      cancel-label="Retour"
      variant="warning"
      :loading="store.cancelling"
      @cancel="closeCancel"
      @confirm="confirmCancel"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer ce paiement"
      :message="`Cette action va supprimer le paiement ${paiementToRemove?.reference || ''}. Cette action doit être auditée côté serveur.`"
      confirm-label="Supprimer paiement"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>
