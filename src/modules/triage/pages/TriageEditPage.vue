<script setup>
import { RouterLink, useRoute } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

const route = useRoute()
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="his-page-title">Modification du triage indisponible</h1>

      <p class="his-page-subtitle">
        Un triage validé constitue une donnée clinique auditée et ne peut pas être modifié depuis cette interface.
      </p>
    </header>

    <BaseCard
      title="Lecture seule"
      subtitle="Toute correction clinique devra suivre une procédure dédiée, traçable et autorisée."
    >
      <div class="flex flex-wrap gap-3">
        <RouterLink :to="`/triage/${route.params.id}`">
          <BaseButton variant="secondary">Consulter le triage</BaseButton>
        </RouterLink>

        <RouterLink to="/triage">
          <BaseButton variant="secondary">Retour à la file</BaseButton>
        </RouterLink>
      </div>
    </BaseCard>
  </div>
</template>
