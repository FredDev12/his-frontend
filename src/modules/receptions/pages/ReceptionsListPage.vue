<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import ReceptionSearchBar from '@/modules/receptions/components/ReceptionSearchBar.vue'
import ReceptionTable from '@/modules/receptions/components/ReceptionTable.vue'
import ReceptionPaymentDialog from '@/modules/receptions/components/ReceptionPaymentDialog.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useReceptionsStore } from '@/modules/receptions/stores/receptions.store'
import { useToastStore } from '@/shared/stores/toast.store'

const auth = useAuthStore()
const store = useReceptionsStore()
const toast = useToastStore()

const receptionToPay = ref(null)
const receptionToRemove = ref(null)

const paymentOpen = ref(false)
const confirmRemoveOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 réception'
  return `${store.pagination.total} réception(s)`
})

onMounted(() => {
  loadReceptions({ page: 1 })
})

async function loadReceptions(params = {}) {
  try {
    await store.fetchReceptions({
      page: params.page || 1,
      limite: params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Réceptions] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les réceptions.')
  }
}

async function goToPage(page) {
  await loadReceptions({
    page,
    limite: store.pagination.limite,
  })
}

async function search(filters) {
  try {
    await store.searchReceptions(filters)
  } catch (error) {
    console.error('[Réceptions] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    urgence: '',
    service: '',
    paye: '',
  }

  await loadReceptions({ page: 1 })
}

function askPay(reception) {
  receptionToPay.value = reception
  paymentOpen.value = true
}

function closePayment() {
  receptionToPay.value = null
  paymentOpen.value = false
}

async function confirmPayment(payload) {
  if (!receptionToPay.value?.id) return

  try {
    await store.validatePayment(receptionToPay.value.id, payload)
    closePayment()
    await loadReceptions({ page: store.pagination.page })
  } catch (error) {
    console.error('[Réceptions] Paiement impossible:', error)
  }
}

function askRemove(reception) {
  receptionToRemove.value = reception
  confirmRemoveOpen.value = true
}

function closeRemove() {
  receptionToRemove.value = null
  confirmRemoveOpen.value = false
}

async function confirmRemove() {
  if (!receptionToRemove.value?.id) return

  try {
    await store.removeReception(receptionToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Réceptions] Suppression impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Réception / Admissions</h1>

        <p class="his-page-subtitle">
          Accueil patient, ouverture de fiche, orientation vers service et paiement initial.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('reception:create')" to="/receptions/create">
        <BaseButton> Nouvelle réception </BaseButton>
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
        :can-pay="auth.hasPermission('paiement:create')" @pay="askPay"
        :can-remove="auth.hasPermission('reception:update')" @remove="askRemove"
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

    <ReceptionPaymentDialog
      :open="paymentOpen"
      :reception="receptionToPay"
      :loading="store.paying"
      @cancel="closePayment"
      @confirm="confirmPayment"
    />

    <ConfirmDialog
      :open="confirmRemoveOpen"
      title="Supprimer cette réception"
      :message="`Cette action va supprimer ou désactiver la réception de ${receptionToRemove?.nom || ''} ${receptionToRemove?.prenom || ''}. Cette action doit être auditée côté serveur.`"
      confirm-label="Supprimer réception"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>

