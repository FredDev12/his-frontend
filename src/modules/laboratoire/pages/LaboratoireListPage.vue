<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import LaboratoireSearchBar from '@/modules/laboratoire/components/LaboratoireSearchBar.vue'
import LaboratoireTable from '@/modules/laboratoire/components/LaboratoireTable.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useLaboratoireStore } from '@/modules/laboratoire/stores/laboratoire.store'
import { useToastStore } from '@/shared/stores/toast.store'

const auth = useAuthStore()
const store = useLaboratoireStore()
const toast = useToastStore()

const examenToRemove = ref(null)
const removeOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 examen'
  return `${store.pagination.total} examen(s)`
})

onMounted(() => {
  loadExamens({ page: 1 })
})

async function loadExamens(params = {}) {
  try {
    await store.fetchExamens({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Laboratoire] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les examens.')
  }
}

async function goToPage(page) {
  await loadExamens({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchExamens(filters)
  } catch (error) {
    console.error('[Laboratoire] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche laboratoire impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    statut: '',
  }

  await loadExamens({ page: 1 })
}

function askRemove(examen) {
  examenToRemove.value = examen
  removeOpen.value = true
}

function closeRemove() {
  examenToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!examenToRemove.value?.id) return

  try {
    await store.removeExamen(examenToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Laboratoire] Suppression impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Laboratoire</h1>

        <p class="his-page-subtitle">
          Demandes d’examens biologiques, résultats et suivi laboratoire.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('examen:create')" to="/laboratoire/create">
        <BaseButton> Nouvelle demande </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <LaboratoireSearchBar
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

      <LaboratoireTable :examens="store.examens" :loading="store.loading" :can-remove="auth.hasPermission('examen:update_result')" @remove="askRemove" />

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
      :open="removeOpen"
      title="Supprimer cet examen"
      :message="`Cette action va supprimer la demande laboratoire ${examenToRemove?.examen_principal || ''}. Cette action doit être auditée côté serveur.`"
      confirm-label="Supprimer examen"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>

