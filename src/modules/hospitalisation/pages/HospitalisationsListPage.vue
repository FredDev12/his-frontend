<script setup>
import { computed, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"

import BaseButton from "@/shared/ui/base/BaseButton.vue"
import BaseCard from "@/shared/ui/base/BaseCard.vue"
import ConfirmDialog from "@/shared/ui/overlay/ConfirmDialog.vue"

import HospitalisationTable from "@/modules/hospitalisation/components/HospitalisationTable.vue"

import { useAuthStore } from "@/modules/auth/stores/auth.store"
import { useHospitalisationStore } from "@/modules/hospitalisation/stores/hospitalisation.store"
import { useToastStore } from "@/shared/stores/toast.store"

const auth = useAuthStore()
const store = useHospitalisationStore()
const toast = useToastStore()

const dischargeOpen = ref(false)
const hospitalisationToDischarge = ref(null)

const totalLabel = computed(() => `${store.pagination.total || 0} hospitalisation(s)`)

onMounted(() => {
  loadHospitalisations({ page: 1 })
})

async function loadHospitalisations(params = {}) {
  try {
    await store.fetchHospitalisations({
      page: params.page || 1,
      limit: params.limit || params.limite || store.pagination.limite,
    })
  } catch (error) {
    toast.error(error.response?.data?.message || "Impossible de charger les hospitalisations.")
  }
}

async function goToPage(page) {
  await loadHospitalisations({ page, limit: store.pagination.limite })
}

function openDischarge(item) {
  hospitalisationToDischarge.value = item
  dischargeOpen.value = true
}

function closeDischarge() {
  hospitalisationToDischarge.value = null
  dischargeOpen.value = false
}

async function confirmDischarge() {
  if (!hospitalisationToDischarge.value?.id) return

  await store.dischargeHospitalisation(hospitalisationToDischarge.value.id, {
    dischargeSummary: "Sortie validée depuis l’interface hospitalisation",
  })

  closeDischarge()
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Hospitalisations</h1>
        <p class="his-page-subtitle">Admissions, lits et sorties d’hospitalisation.</p>
      </div>

      <RouterLink v-if="auth.hasPermission('hospitalisation:create')" to="/hospitalisation/create">
        <BaseButton>Nouvelle hospitalisation</BaseButton>
      </RouterLink>
    </header>

    <div v-if="store.error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ store.error }}
    </div>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">{{ totalLabel }}</span>
      </template>

      <HospitalisationTable
        :hospitalisations="store.hospitalisations"
        :loading="store.loading"
        :can-discharge="auth.hasPermission('hospitalisation:update')"
        @discharge="openDischarge"
      />

      <div class="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          Page {{ store.pagination.page }} · Limite {{ store.pagination.limite }}
        </p>

        <div class="flex gap-2">
          <BaseButton variant="secondary" :disabled="store.loading || store.pagination.page <= 1" @click="goToPage(store.pagination.page - 1)">
            Précédent
          </BaseButton>

          <BaseButton variant="secondary" :disabled="store.loading || !store.pagination.hasNext" @click="goToPage(store.pagination.page + 1)">
            Suivant
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <ConfirmDialog
      :open="dischargeOpen"
      title="Sortie d’hospitalisation"
      :message="`Cette action va clôturer l’hospitalisation ${hospitalisationToDischarge?.hospitalisationCode || ''} et libérer le lit. Cette action doit être auditée côté serveur.`"
      confirm-label="Valider sortie"
      cancel-label="Retour"
      variant="warning"
      :loading="store.discharging"
      @cancel="closeDischarge"
      @confirm="confirmDischarge"
    />
  </div>
</template>
