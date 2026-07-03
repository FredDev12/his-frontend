<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import ConfirmDialog from '@/shared/ui/overlay/ConfirmDialog.vue'

import ConsultationSearchBar from '@/modules/consultations/components/ConsultationSearchBar.vue'
import ConsultationTable from '@/modules/consultations/components/ConsultationTable.vue'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useConsultationsStore } from '@/modules/consultations/stores/consultations.store'
import { useToastStore } from '@/shared/stores/toast.store'

const auth = useAuthStore()
const store = useConsultationsStore()
const toast = useToastStore()

const consultationToRemove = ref(null)
const removeOpen = ref(false)

const totalLabel = computed(() => {
  if (!store.pagination.total) return '0 consultation'
  return `${store.pagination.total} consultation(s)`
})

onMounted(() => {
  loadConsultations({ page: 1 })
})

async function loadConsultations(params = {}) {
  try {
    await store.fetchConsultations({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    console.error('[Consultations] Erreur chargement:', error)
    toast.error(error.response?.data?.message || 'Impossible de charger les consultations.')
  }
}

async function goToPage(page) {
  await loadConsultations({ page, limit: store.pagination.limite })
}

async function search(filters) {
  try {
    await store.searchConsultations(filters)
  } catch (error) {
    console.error('[Consultations] Erreur recherche:', error)
    toast.error(error.response?.data?.message || 'Recherche consultation impossible.')
  }
}

async function resetSearch() {
  store.filters = {
    q: '',
    service: '',
    statut: '',
  }

  await loadConsultations({ page: 1 })
}

function askRemove(consultation) {
  consultationToRemove.value = consultation
  removeOpen.value = true
}

function closeRemove() {
  consultationToRemove.value = null
  removeOpen.value = false
}

async function confirmRemove() {
  if (!consultationToRemove.value?.id) return

  try {
    await store.removeConsultation(consultationToRemove.value.id)
    closeRemove()
  } catch (error) {
    console.error('[Consultations] Suppression impossible:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Consultations</h1>

        <p class="his-page-subtitle">
          Dossier médical, anamnèse, examen clinique, diagnostic et prise en charge.
        </p>
      </div>

      <RouterLink v-if="auth.hasPermission('consultation:create')" to="/consultations/create">
        <BaseButton> Nouvelle consultation </BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <ConsultationSearchBar
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

      <ConsultationTable
        :consultations="store.consultations"
        :loading="store.loading"
        :can-remove="auth.hasPermission('consultation:update')" @remove="askRemove"
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
      :open="removeOpen"
      title="Supprimer cette consultation"
      :message="`Cette action va supprimer la consultation de ${consultationToRemove?.nom || ''} ${consultationToRemove?.prenom || ''}. Cette action doit être auditée côté serveur.`"
      confirm-label="Supprimer consultation"
      cancel-label="Annuler"
      variant="danger"
      :loading="store.deleting"
      @cancel="closeRemove"
      @confirm="confirmRemove"
    />
  </div>
</template>

