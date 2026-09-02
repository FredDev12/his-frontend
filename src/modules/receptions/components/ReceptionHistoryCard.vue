<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  total: {
    type: Number,
    default: 0,
  },
  currentReceptionId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['load-more'])

const hasMore = computed(() => props.items.length < props.total)

function isCurrent(item) {
  return String(item?.id) === String(props.currentReceptionId)
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function receptionStatusLabel(status) {
  const labels = {
    ADMIS: 'Admis',
    EN_ATTENTE_PAIEMENT: 'Paiement en attente',
    BROUILLON: 'Brouillon',
    ANNULE: 'Annulé',
    ANNULEE: 'Annulé',
  }

  return labels[status] || status || '—'
}

function receptionStatusVariant(status) {
  if (['ANNULE', 'ANNULEE'].includes(status)) return 'danger'
  if (status === 'ADMIS') return 'success'
  if (status === 'EN_ATTENTE_PAIEMENT') return 'warning'
  return 'neutral'
}

function episodeStatusLabel(status) {
  const labels = {
    NOUVEAU: 'Nouveau',
    EN_TRIAGE: 'En triage',
    EN_ATTENTE_CONSULTATION: 'En attente de consultation',
    EN_CONSULTATION: 'En consultation',
    EN_ATTENTE_RESULTATS: 'En attente de résultats',
    HOSPITALISE: 'Hospitalisé',
    PRET_SORTIE: 'Prêt pour sortie',
    SORTI: 'Sorti',
    ANNULE: 'Annulé',
  }

  return labels[status] || status || '—'
}
</script>

<template>
  <BaseCard
    title="Historique des passages"
    subtitle="Visites administratives associées à cette fiche patient, du passage le plus récent au plus ancien."
  >
    <div
      v-if="loading && !items.length"
      class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
    >
      Chargement de l’historique...
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!items.length"
      class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
    >
      Aucun autre passage enregistré pour cette fiche patient.
    </div>

    <div v-else class="space-y-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl border p-4"
        :class="
          isCurrent(item)
            ? 'border-blue-300 bg-blue-50'
            : 'border-slate-200 bg-white'
        "
      >
        <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div class="min-w-0 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <strong class="text-sm text-slate-950">
                {{ item.numero_fiche || item.receptionCode || '—' }}
              </strong>

              <BaseBadge v-if="isCurrent(item)" variant="primary">
                Passage actuel
              </BaseBadge>

              <BaseBadge :variant="receptionStatusVariant(item.status || item.statut)">
                {{ receptionStatusLabel(item.status || item.statut) }}
              </BaseBadge>
            </div>

            <div class="grid gap-x-6 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
              <span>
                <strong class="font-medium text-slate-700">Date :</strong>
                {{ formatDate(item.created_at || item.createdAt) }}
              </span>

              <span>
                <strong class="font-medium text-slate-700">Épisode :</strong>
                {{ item.numero_episode || item.episodeCode || '—' }}
              </span>

              <span>
                <strong class="font-medium text-slate-700">Destination :</strong>
                {{ item.workflow?.destination || item.service || 'TRIAGE' }}
              </span>

              <span>
                <strong class="font-medium text-slate-700">Paiement :</strong>
                {{ item.paiementLabel || '—' }}
              </span>
            </div>

            <p class="text-sm text-slate-600">
              <strong class="font-medium text-slate-700">Statut de l’épisode :</strong>
              {{ episodeStatusLabel(item.episode?.status) }}
            </p>
          </div>

          <RouterLink :to="`/receptions/${item.id}`">
            <BaseButton variant="secondary" class="w-full justify-center lg:w-auto">
              Voir ce passage
            </BaseButton>
          </RouterLink>
        </div>
      </article>

      <div class="flex flex-col justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
        <p class="text-sm text-slate-500">
          {{ items.length }} passage{{ items.length > 1 ? 's' : '' }} affiché{{ items.length > 1 ? 's' : '' }}
          sur {{ total }}.
        </p>

        <BaseButton
          v-if="hasMore"
          variant="secondary"
          :loading="loading"
          loading-text="Chargement..."
          @click="emit('load-more')"
        >
          Afficher plus
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>
