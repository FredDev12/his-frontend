<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/ui/base/BaseButton.vue'
import ReceptionStatusBadge from '@/modules/receptions/components/ReceptionStatusBadge.vue'

defineProps({
  canPay: { type: Boolean, default: false },
  canRemove: { type: Boolean, default: false },
  receptions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['pay', 'remove'])

function fullName(reception) {
  return [reception.nom, reception.postnom, reception.prenom].filter(Boolean).join(' ') || '—'
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="hidden overflow-x-auto md:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Patient
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              N° fiche
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Service
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Montant
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Statut
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Chargement des réceptions...
            </td>
          </tr>

          <tr v-else-if="receptions.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
              Aucune réception trouvée.
            </td>
          </tr>

          <tr
            v-for="reception in receptions"
            v-else
            :key="reception.id || reception.numero_fiche"
            class="hover:bg-slate-50"
          >
            <td class="px-4 py-4">
              <p class="font-medium text-slate-950">
                {{ fullName(reception) }}
              </p>
              <p class="mt-1 text-xs text-slate-500">Patient N° {{ reception.numero_patient }}</p>
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ reception.numero_fiche }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">
              {{ reception.service }}
            </td>

            <td class="px-4 py-4 text-sm text-slate-600">{{ reception.montant }} CDF</td>

            <td class="px-4 py-4">
              <ReceptionStatusBadge :reception="reception" />
            </td>

            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <RouterLink :to="`/receptions/${reception.id}`">
                  <BaseButton variant="secondary" size="sm"> Voir </BaseButton>
                </RouterLink>

                <RouterLink :to="`/receptions/${reception.id}/edit`">
                  <BaseButton variant="secondary" size="sm"> Modifier </BaseButton>
                </RouterLink>

                <BaseButton
                  v-if="canPay && !reception.paiement_effectue"
                  variant="success"
                  size="sm"
                  @click="$emit('pay', reception)"
                >
                  Payer
                </BaseButton>

                <BaseButton variant="danger" size="sm" v-if="canRemove" @click="$emit('remove', reception)">
                  Supprimer
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
        Chargement des réceptions...
      </div>

      <div
        v-else-if="receptions.length === 0"
        class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500"
      >
        Aucune réception trouvée.
      </div>

      <article
        v-for="reception in receptions"
        v-else
        :key="reception.id || reception.numero_fiche"
        class="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              {{ fullName(reception) }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">Fiche {{ reception.numero_fiche }}</p>
          </div>

          <ReceptionStatusBadge :reception="reception" />
        </div>

        <div class="mt-4 space-y-1 text-sm text-slate-600">
          <p>
            Service : <span class="font-medium text-slate-900">{{ reception.service }}</span>
          </p>
          <p>
            Montant : <span class="font-medium text-slate-900">{{ reception.montant }} CDF</span>
          </p>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <RouterLink :to="`/receptions/${reception.id}`">
            <BaseButton variant="secondary" size="sm">Voir</BaseButton>
          </RouterLink>

          <RouterLink :to="`/receptions/${reception.id}/edit`">
            <BaseButton variant="secondary" size="sm">Modifier</BaseButton>
          </RouterLink>

          <BaseButton
            v-if="canPay && !reception.paiement_effectue"
            variant="success"
            size="sm"
            @click="$emit('pay', reception)"
          >
            Payer
          </BaseButton>

          <BaseButton variant="danger" size="sm" v-if="canRemove" @click="$emit('remove', reception)">
            Supprimer
          </BaseButton>
        </div>
      </article>
    </div>
  </div>
</template>

