<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import RendezVousSearchBar from '@/modules/rendez-vous/components/RendezVousSearchBar.vue'
import RendezVousTable from '@/modules/rendez-vous/components/RendezVousTable.vue'

import { useRendezVousStore } from '@/modules/rendez-vous/stores/rendezvous.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useRendezVousStore()
const toast = useToastStore()

const rdvToConfirm = ref(null)
const rdvToComplete = ref(null)
const rdvToCancel = ref(null)
const rdvToRemove = ref(null)

const confirmOpen = ref(false)
const completeOpen = ref(false)
const cancelOpen = ref(false)
const removeOpen = ref(false)

const totalLabel = computed(() => `${store.pagination.total || 0} rendez-vous`)

onMounted(() => {
  loadRendezVous({ page: 1 })
})

async function loadRendezVous(params = {}) {
  try {
    await store.fetchRendezVous({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Rendez-vous] Chargement impossible:', error)
    toast.error(error.message || 'Impossible de charger les rendez-vous.')
  }
}

async function goToPage(page) {
  await loadRendezVous({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchRendezVous(filters)
  } catch (error) {
    console.error('[Rendez-vous] Recherche impossible:', error)
    toast.error(error.message || 'Recherche rendez-vous impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
    service: '',
    date_rdv: '',
  }

  await loadRendezVous({ page: 1 })
}

function fullName(rdv) {
  return [rdv?.nom, rdv?.postnom, rdv?.prenom].filter(Boolean).join(' ') || 'ce patient'
}

function askConfirm(rdv) {
  rdvToConfirm.value = rdv
  confirmOpen.value = true
}

function closeConfirm() {
  rdvToConfirm.value = null
  confirmOpen.value = false
}

async function confirmRdv() {
  if (!rdvToConfirm.value?.id) return
  await store.confirmRendezVous(rdvToConfirm.value)
  closeConfirm()
  await loadRendezVous({ page: store.pagination.page })
}

function askComplete(rdv) {
  rdvToComplete.value = rdv
  completeOpen.value = true
}

function closeComplete() {
  rdvToComplete.value = null
  completeOpen.value = false
}

async function completeRdv() {
  if (!rdvToComplete.value?.id) return
  await store.completeRendezVous(rdvToComplete.value)
  closeComplete()
  await loadRendezVous({ page: store.pagination.page })
}

function askCancel(rdv) {
  rdvToCancel.value = rdv
  cancelOpen.value = true
}

function closeCancel() {
  rdvToCancel.value = null
  cancelOpen.value = false
}

async function cancelRdv() {
  if (!rdvToCancel.value?.id) return
  await store.cancelRendezVous(rdvToCancel.value)
  closeCancel()
  await loadRendezVous({ page: store.pagination.page })
}

function askRemove(rdv) {
  rdvToRemove.value = rdv
  removeOpen.value = true
}

function closeRemove() {
  rdvToRemove.value = null
  removeOpen.value = false
}

async function removeRdv() {
  if (!rdvToRemove.value?.id) return
  await store.removeRendezVous(rdvToRemove.value.id)
  closeRemove()
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Rendez-vous</h1>

        <p class="his-page-subtitle">
          Planification des patients avant réception, consultation ou service clinique.
        </p>
      </div>

      <RouterLink to="/rendez-vous/create">
        <BaseButton> Nouveau rendez-vous </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <RendezVousSearchBar
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

      <RendezVousTable
        :rendez-vous="store.rendezVous"
        :loading="store.loading"
        @confirm="askConfirm"
        @complete="askComplete"
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
      :open="confirmOpen"
      title="Confirmer ce rendez-vous"
      :message="`Confirmer le rendez-vous de ${fullName(rdvToConfirm)}.`"
      confirm-label="Confirmer rendez-vous"
      cancel-label="Annuler"
      variant="success"
      :loading="store.confirming"
      @cancel="closeConfirm"
      @confirm="confirmRdv"
    />

    <ConfirmDialog
      :open="completeOpen"
      title="Marquer comme terminé"
      :message="`Ce rendez-vous sera marqué comme honoré / terminé pour ${fullName(rdvToComplete)}.`"
      confirm-label="Marquer terminé"
      cancel-label="Annuler"
      variant="primary"
      :loading="store.completing"
      @cancel="closeComplete"
      @confirm="completeRdv"
    />

    <ConfirmDialog
      :open="cancelOpen"
      title="Annuler ce rendez-vous"
      :message="`Annuler le rendez-vous de ${fullName(rdvToCancel)}.`"
      confirm-label="Annuler rendez-vous"
      cancel-label="Retour"
      variant="warning"
      :loading="store.cancelling"
      @cancel="closeCancel"
      @confirm="cancelRdv"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer ce rendez-vous"
      :message="`Supprimer définitivement le rendez-vous de ${fullName(rdvToRemove)} du référentiel local.`"
      confirm-label="Supprimer rendez-vous"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="removeRdv"
    />
  </div>
</template>
