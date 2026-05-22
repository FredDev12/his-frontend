<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import LaboratoireIdentityCard from '@/modules/laboratoire/components/LaboratoireIdentityCard.vue'

import { useLaboratoireStore } from '@/modules/laboratoire/stores/laboratoire.store'

const route = useRoute()
const router = useRouter()
const store = useLaboratoireStore()

const examenId = computed(() => route.params.id)
const examen = computed(() => store.selectedExamen)

onMounted(async () => {
  try {
    await store.fetchExamenById(examenId.value)
  } catch {
    router.push('/laboratoire')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail laboratoire</h1>

        <p class="his-page-subtitle">Détail de la demande, examens et résultats.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <RouterLink to="/laboratoire">
          <BaseButton variant="secondary"> Retour </BaseButton>
        </RouterLink>

        <RouterLink v-if="examen" :to="`/laboratoire/${examen.id}/edit`">
          <BaseButton> Modifier examen </BaseButton>
        </RouterLink>
      </div>
    </header>

    <div v-if="store.loading" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de l’examen...
    </div>

    <div v-else-if="examen" class="space-y-6">
      <LaboratoireIdentityCard :examen="examen" />

      <BaseCard title="Examens demandés" subtitle="Liste complète des examens et résultats saisis.">
        <div class="space-y-3">
          <div
            v-for="(item, index) in examen.examens"
            :key="index"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex flex-col justify-between gap-2 md:flex-row md:items-start">
              <div>
                <p class="font-semibold text-slate-900">
                  {{ item.examen }}
                </p>

                <p class="mt-1 text-sm text-slate-500">Date : {{ item.date || '—' }}</p>
              </div>

              <span
                class="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
              >
                {{ item.resultat ? 'Résultat saisi' : 'En attente' }}
              </span>
            </div>

            <p class="mt-4 text-sm leading-6 text-slate-600">
              <strong class="text-slate-900">Résultat :</strong>
              {{ item.resultat || 'Aucun résultat renseigné.' }}
            </p>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
