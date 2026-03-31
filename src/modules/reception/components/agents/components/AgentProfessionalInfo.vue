<script setup>
defineProps({
  agent: Object
})
</script>

<template>

  <div class="bg-white shadow rounded p-4">

    <h3 class="font-bold mb-3">
      Informations professionnelles
    </h3>

    <p><b>Fonction : </b> {{ agent.fonction }}</p>

    <p><b>Grade : </b> {{ agent.grand }}</p>

    <p><b>Site : </b> {{ agent.site }}</p>

    <p><b>Equipe : </b> {{ agent.team }}</p>

    <p><b>Contrat : </b> {{ agent.contract }}</p>

    <p><b>Date embauche : </b> {{ agent.date_embauche }}</p>

  </div>

</template>