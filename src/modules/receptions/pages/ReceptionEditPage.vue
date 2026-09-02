<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

const route = useRoute()
const receptionId = computed(() => route.params.id)
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modification indisponible</h1>
      <p class="his-page-subtitle">
        Une réception admise ou annulée ne peut pas être réécrite depuis un formulaire général.
      </p>
    </header>

    <BaseCard
      title="Réception protégée"
      subtitle="Les données cliniques, financières et les identifiants sont immuables depuis ce module."
    >
      <div class="space-y-4 text-sm leading-6 text-slate-600">
        <p>
          L’identité permanente du patient doit être corrigée depuis la fiche patient, avec permission
          dédiée et audit. Le paiement est géré par la transaction financière. Le motif, la priorité et
          le service clinique sont renseignés au triage.
        </p>

        <p>
          Pour corriger le statut administratif d’une réception erronée, utilisez l’action
          <strong>Annuler</strong> depuis la liste, avec confirmation et traçabilité.
        </p>

        <RouterLink :to="`/receptions/${receptionId}`">
          <BaseButton>Retour au détail de la réception</BaseButton>
        </RouterLink>
      </div>
    </BaseCard>
  </div>
</template>
