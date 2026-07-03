<script setup>
import { computed, onMounted } from "vue"
import { RouterLink } from "vue-router"

import BaseButton from "@/shared/ui/base/BaseButton.vue"
import BaseCard from "@/shared/ui/base/BaseCard.vue"
import SortieTable from "@/modules/sorties/components/SortieTable.vue"

import { useAuthStore } from "@/modules/auth/stores/auth.store"
import { useSortiesStore } from "@/modules/sorties/stores/sorties.store"

const auth = useAuthStore()
const store = useSortiesStore()

const totalLabel = computed(() => `${store.pagination.total || 0} sortie(s)`)

onMounted(() => {
  store.fetchSorties({ page: 1 })
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Sorties patient</h1>
        <p class="his-page-subtitle">Liste des sorties et épisodes clôturés.</p>
      </div>

      <RouterLink v-if="auth.hasPermission('sortie:create')" to="/sorties/create">
        <BaseButton variant="warning">Créer sortie</BaseButton>
      </RouterLink>
    </header>

    <BaseCard>
      <template #actions>
        <span class="text-sm font-medium text-slate-500">{{ totalLabel }}</span>
      </template>

      <SortieTable :sorties="store.sorties" :loading="store.loading" />
    </BaseCard>
  </div>
</template>
