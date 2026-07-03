<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import FactureSummaryCards from '@/modules/facturation/components/FactureSummaryCards.vue'
import FactureSearchBar from '@/modules/facturation/components/FactureSearchBar.vue'
import FactureTable from '@/modules/facturation/components/FactureTable.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useFacturationStore } from '@/modules/facturation/stores/facturation.store'
import { useToastStore } from '@/shared/stores/toast.store'

const auth = useAuthStore()
const store = useFacturationStore()
const toast = useToastStore()

const factureToIssue = ref(null)
const factureToPay = ref(null)
const factureToCancel = ref(null)
const factureToRemove = ref(null)

const issueOpen = ref(false)
const payOpen = ref(false)
const cancelOpen = ref(false)
const removeOpen = ref(false)

const totalLabel = computed(() => `${store.pagination.total || 0} facture(s)`)

onMounted(() => {
  loadFactures({ page: 1 })
})

async function loadFactures(params = {}) {
  try {
    await store.fetchFactures({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    toast.error(error.message || 'Impossible de charger les factures.')
  }
}

async function goToPage(page) {
  await loadFactures({ page, limit: store.pagination.limite })
}

async function search(filters) {
  await store.searchFactures(filters)
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
    date: '',
  }

  await loadFactures({ page: 1 })
}

function openIssue(facture) {
  factureToIssue.value = facture
  issueOpen.value = true
}

function closeIssue() {
  factureToIssue.value = null
  issueOpen.value = false
}

async function confirmIssue() {
  if (!factureToIssue.value?.id) return
  await store.issueFacture(factureToIssue.value)
  closeIssue()
  await loadFactures({ page: store.pagination.page })
}

function openPay(facture) {
  factureToPay.value = facture
  payOpen.value = true
}

function closePay() {
  factureToPay.value = null
  payOpen.value = false
}

async function confirmPay() {
  if (!factureToPay.value?.id) return
  await store.markFacturePaid(factureToPay.value)
  closePay()
  await loadFactures({ page: store.pagination.page })
}

function openCancel(facture) {
  factureToCancel.value = facture
  cancelOpen.value = true
}

function closeCancel() {
  factureToCancel.value = null
  cancelOpen.value = false
}

async function confirmCancel() {
  if (!factureToCancel.value?.id) return
  await store.cancelFacture(factureToCancel.value)
  closeCancel()
  await loadFactures({ page: store.pagination.page })
}

function openRemove(facture) {
  factureToRemove.value = facture
  removeOpen.value = true
}

function closeRemove() {
  factureToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!factureToRemove.value?.id) return
  await store.removeFacture(factureToRemove.value.id)
  closeRemove()
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Facturation</h1>

        <p class="his-page-subtitle">
          Gestion des factures, lignes, montants dus et statuts financiers.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('facture:create')" to="/facturation/create">
        <BaseButton> Nouvelle facture </BaseButton>
      </RouterLink>
    </header>

    <FactureSummaryCards :store="store" />

    <BaseCard>
      <FactureSearchBar
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

      <FactureTable
        :factures="store.factures"
        :loading="store.loading"
        :can-issue="auth.hasPermission('facture:create')" @issue="openIssue"
        :can-pay="auth.hasPermission('paiement:create')" @paid="openPay"
        :can-cancel="auth.hasPermission('facture:cancel')" @cancel="openCancel"
        :can-remove="auth.hasPermission('facture:cancel')" @remove="openRemove"
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
      :open="issueOpen"
      title="Émettre cette facture"
      :message="`La facture ${factureToIssue?.numero || ''} passera du brouillon au statut émise.`"
      confirm-label="Émettre facture"
      cancel-label="Annuler"
      variant="primary"
      :loading="store.issuing"
      @cancel="closeIssue"
      @confirm="confirmIssue"
    />

    <ConfirmDialog
      :open="payOpen"
      title="Marquer cette facture comme payée"
      :message="`Cette action indique que la facture ${factureToPay?.numero || ''} est payée. En production, cette action devra être liée à la Caisse.`"
      confirm-label="Marquer payée"
      cancel-label="Annuler"
      variant="success"
      :loading="store.paying"
      @cancel="closePay"
      @confirm="confirmPay"
    />

    <ConfirmDialog
      :open="cancelOpen"
      title="Annuler cette facture"
      :message="`Annuler la facture ${factureToCancel?.numero || ''}. Cette action doit rester traçable.`"
      confirm-label="Annuler facture"
      cancel-label="Retour"
      variant="warning"
      :loading="store.cancelling"
      @cancel="closeCancel"
      @confirm="confirmCancel"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer cette facture"
      :message="`Supprimer définitivement la facture ${factureToRemove?.numero || ''} du référentiel local.`"
      confirm-label="Supprimer facture"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>

