<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import DataTable from '@/shared/ui/data/DataTable.vue'

import { useLaboratoireStore } from '@/modules/laboratoire/stores/laboratoire.store'

const store = useLaboratoireStore()

const columns = [
  { key: 'patient', label: 'Patient' },
  { key: 'examen', label: 'Examen' },
  { key: 'episode', label: 'Épisode' },
  { key: 'statut', label: 'Statut' },
]

const recentRows = computed(() =>
  store.examens.slice(0, 6).map((item) => ({
    id: item.id,
    patient:
      [item.nom, item.postnom, item.prenom]
        .filter(Boolean)
        .join(' ') || 'Patient',
    examen: item.examen_principal,
    episode: item.episode_code,
    statut: item.statut,
  })),
)

const stats = computed(() => store.laboratoireKpis)

onMounted(async () => {
  await Promise.all([
    store.fetchExamens({
      page: 1,
      limit: 10,
    }),
    store.fetchKpis(),
  ])
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <BaseBadge variant="primary">Service Laboratoire</BaseBadge>

        <h1 class="mt-3 his-page-title">
          Dashboard Laboratoire
        </h1>

        <p class="his-page-subtitle">
          File opérationnelle des examens biologiques reçus depuis les consultations médicales.
        </p>
      </div>

      <RouterLink to="/laboratoire">
        <BaseButton>
          Ouvrir la file laboratoire
        </BaseButton>
      </RouterLink>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <BaseCard title="Demandes">
        <p class="text-3xl font-bold text-slate-950">
          {{ stats.total }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Examens dans le périmètre
        </p>
      </BaseCard>

      <BaseCard title="En attente">
        <p class="text-3xl font-bold text-amber-700">
          {{ stats.examensEnAttente }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          À traiter
        </p>
      </BaseCard>

      <BaseCard title="Résultats disponibles">
        <p class="text-3xl font-bold text-emerald-700">
          {{ stats.resultatsDisponibles }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Résultats validés
        </p>
      </BaseCard>

      <BaseCard title="En cours">
        <p class="text-3xl font-bold text-blue-700">
          {{ stats.enCours }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Examens en traitement
        </p>
      </BaseCard>
    </section>

    <BaseCard
      title="Demandes récentes"
      subtitle="Derniers examens biologiques visibles dans votre périmètre."
    >
      <DataTable
        :columns="columns"
        :rows="recentRows"
        empty-text="Aucune demande laboratoire disponible."
      />

      <div class="mt-5 flex justify-end">
        <RouterLink to="/laboratoire">
          <BaseButton variant="secondary">
            Voir toutes les demandes
          </BaseButton>
        </RouterLink>
      </div>
    </BaseCard>

    <BaseCard
      title="Règles métier Laboratoire"
      subtitle="Séparation des responsabilités et traçabilité."
    >
      <ul class="space-y-2 text-sm text-slate-600">
        <li>• Les demandes sont créées par le médecin depuis une consultation active.</li>
        <li>• Le Laboratoire ne voit que les examens biologiques autorisés par le backend.</li>
        <li>• La validation d’un résultat est définitive dans ce workflow.</li>
        <li>• Tant qu’un autre examen actif existe, l’épisode reste en attente de résultats.</li>
      </ul>
    </BaseCard>
  </div>
</template>

