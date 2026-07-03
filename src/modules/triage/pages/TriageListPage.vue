<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import TriageSearchBar from '@/modules/triage/components/TriageSearchBar.vue'
import TriageTable from '@/modules/triage/components/TriageTable.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useTriageStore } from '@/modules/triage/stores/triage.store'
import { useToastStore } from '@/shared/stores/toast.store'

const auth = useAuthStore()
const store = useTriageStore()
const toast = useToastStore()

const triageToRemove = ref(null)
const triageToUrgent = ref(null)

const removeOpen = ref(false)
const urgentOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 triage'
  return `${store.pagination.total} triage(s)`
})

onMounted(() => {
  loadTriages({ page: 1 })
})

async function loadTriages(params = {}) {
  try {
    await store.fetchTriages({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Triage] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les triages.')
  }
}

async function goToPage(page) {
  await loadTriages({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchTriages(filters)
  } catch (error) {
    console.error('[Triage] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche triage impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    service: '',
    priorite: '',
    type_passage: '',
  }

  await loadTriages({ page: 1 })
}

function askRemove(triage) {
  triageToRemove.value = triage
  removeOpen.value = true
}

function closeRemove() {
  triageToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!triageToRemove.value?.id) return

  try {
    await store.removeTriage(triageToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Triage] Suppression impossible:', error)
  }
}

function askUrgent(triage) {
  triageToUrgent.value = triage
  urgentOpen.value = true
}

function closeUrgent() {
  triageToUrgent.value = null
  urgentOpen.value = false
}

async function confirmUrgent() {
  if (!triageToUrgent.value?.id) return

  try {
    await store.updateStatus(triageToUrgent.value.id, {
      statut: 'URGENT',
      status: 'URGENT',
      details: {
        priorite: 'URGENT',
      },
    })

    closeUrgent()
    await loadTriages({ page: store.pagination.page })
  } catch (error) {
    console.error('[Triage] Passage urgence impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Triage / Urgences</h1>

        <p class="his-page-subtitle">
          Signes vitaux, priorité clinique et orientation vers le service.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('triage:create')" to="/triage/create">
        <BaseButton> Nouveau triage </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <TriageSearchBar
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

      <TriageTable
        :triages="store.triages"
        :loading="store.loading"
        :can-remove="auth.hasPermission('triage:update')" @remove="askRemove"
        :can-mark-urgent="auth.hasPermission('triage:update')" @status="askUrgent"
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
      :open="urgentOpen"
      title="Marquer ce triage comme urgence"
      :message="`Cette action va marquer le patient ${triageToUrgent?.nom || ''} ${triageToUrgent?.prenom || ''} comme URGENT. Cette action doit être auditée côté serveur.`"
      confirm-label="Marquer urgent"
      cancel-label="Annuler"
      variant="emergency"
      :loading="store.saving"
      @cancel="closeUrgent"
      @confirm="confirmUrgent"
    />

    <ConfirmDialog
      :open="removeOpen"
      title="Supprimer ce triage"
      :message="`Cette action va supprimer le triage de ${triageToRemove?.nom || ''} ${triageToRemove?.prenom || ''}.`"
      confirm-label="Supprimer triage"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>

