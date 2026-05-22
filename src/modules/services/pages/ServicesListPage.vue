<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import ServiceSearchBar from '@/modules/services/components/ServiceSearchBar.vue'
import ServiceTable from '@/modules/services/components/ServiceTable.vue'
import ServiceSummaryCards from '@/modules/services/components/ServiceSummaryCards.vue'

import { useHospitalServicesStore } from '@/modules/services/stores/services.store'
import { useToastStore } from '@/shared/stores/toast.store'

const store = useHospitalServicesStore()
const toast = useToastStore()

const serviceToActivate = ref(null)
const serviceToDeactivate = ref(null)
const serviceToRemove = ref(null)

const activateOpen = ref(false)
const deactivateOpen = ref(false)
const removeOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 service'
  return `${store.pagination.total} service(s)`
})

onMounted(() => {
  loadServices({ page: 1 })
})

async function loadServices(params = {}) {
  try {
    await store.fetchServices({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Services] Erreur chargement:', error)
    toast.error(error.message || 'Impossible de charger les services.')
  }
}
function hasActiveFilters() {
  return Object.values(store.filters).some((value) => String(value || '').trim())
}

async function goToPage(page) {
  try {
    if (hasActiveFilters()) {
      await store.searchServices({
        ...store.filters,
        page,
        limit: store.pagination.limite,
      })

      return
    }

    await loadServices({
      page,
      limit: store.pagination.limite,
    })
  } catch (error) {
    console.error('[Services] Pagination impossible:', error)
    toast.error(error.message || 'Pagination services impossible.')
  }
}

async function search(filters) {
  try {
    await store.searchServices({
      q: filters.q || '',
      statut: filters.statut || '',
      categorie: filters.categorie || '',
      module_source: filters.module_source || '',
      visible_dans_facturation: filters.visible_dans_facturation ?? '',
      visible_dans_reception: filters.visible_dans_reception ?? '',
    })
  } catch (error) {
    console.error('[Services] Erreur recherche:', error)
    toast.error(error.message || 'Recherche service impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
    categorie: '',
    module_source: '',
    visible_dans_facturation: '',
    visible_dans_reception: '',
  }

  await loadServices({ page: 1 })
}

function askActivate(service) {
  serviceToActivate.value = service
  activateOpen.value = true
}

function closeActivate() {
  serviceToActivate.value = null
  activateOpen.value = false
}

async function confirmActivate() {
  if (!serviceToActivate.value?.id) return

  try {
    await store.activateService(serviceToActivate.value)
    closeActivate()
    await loadServices({ page: store.pagination.page })
  } catch (error) {
    console.error('[Services] Activation impossible:', error)
  }
}

function askDeactivate(service) {
  serviceToDeactivate.value = service
  deactivateOpen.value = true
}

function closeDeactivate() {
  serviceToDeactivate.value = null
  deactivateOpen.value = false
}

async function confirmDeactivate() {
  if (!serviceToDeactivate.value?.id) return

  try {
    await store.deactivateService(serviceToDeactivate.value)
    closeDeactivate()
    await loadServices({ page: store.pagination.page })
  } catch (error) {
    console.error('[Services] Désactivation impossible:', error)
  }
}

function askRemove(service) {
  serviceToRemove.value = service
  removeOpen.value = true
}

function closeRemove() {
  serviceToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!serviceToRemove.value?.id) return

  try {
    await store.removeService(serviceToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Services] Suppression impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Services hospitaliers</h1>

        <p class="his-page-subtitle">
          Référentiel des services internes, responsables, statuts et modules associés.
        </p>
      </div>

      <RouterLink to="/services/create">
        <BaseButton> Nouveau service </BaseButton>
      </RouterLink>
    </header>

    <ServiceSummaryCards :store="store" />

    <BaseCard>
      <ServiceSearchBar
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

      <ServiceTable
        :services="store.services"
        :loading="store.loading"
        @activate="askActivate"
        @deactivate="askDeactivate"
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
      :open="activateOpen"
      title="Activer ce service"
      :message="`Cette action va rendre le service ${serviceToActivate?.nom || ''} actif dans le référentiel.`"
      confirm-label="Activer service"
      cancel-label="Annuler"
      variant="success"
      :loading="store.activating"
      @cancel="closeActivate"
      @confirm="confirmActivate"
    />

    <ConfirmDialog
      :open="deactivateOpen"
      title="Désactiver ce service"
      :message="`Cette action va désactiver le service ${serviceToDeactivate?.nom || ''}. Il restera visible mais ne devra plus être utilisé dans les nouveaux flux.`"
      confirm-label="Désactiver service"
      cancel-label="Annuler"
      variant="warning"
      :loading="store.deactivating"
      @cancel="closeDeactivate"
      @confirm="confirmDeactivate"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer ce service"
      :message="`Supprimer ${serviceToRemove?.nom || ''}. Cette action peut impacter la facturation si ce service est utilisé.`"
      confirm-label="Supprimer service"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>
