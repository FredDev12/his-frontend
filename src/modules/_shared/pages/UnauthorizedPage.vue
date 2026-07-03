<script setup>
import BaseCard from "@/shared/ui/base/BaseCard.vue";
import BaseButton from "@/shared/ui/base/BaseButton.vue";
</script>

<template>
  <BaseCard
    title="Accès refusé"
    subtitle="Vous n’avez pas la permission nécessaire pour accéder à cette page."
  >
    <div class="space-y-4">
      <p class="text-sm text-slate-600">
        Si cette action est nécessaire dans votre service, contactez l’administrateur HIS.
      </p>

      <RouterLink to="/">
        <BaseButton variant="secondary">
          Retour au dashboard
        </BaseButton>
      </RouterLink>
    </div>
  </BaseCard>
</template>
