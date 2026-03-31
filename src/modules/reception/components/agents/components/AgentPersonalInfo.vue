<script setup>

import { computed } from "vue"

const props = defineProps({
  agent: Object
})

const age = computed(() => {

  if (!props.agent.date_de_naissance) return "-"

  const birth = new Date(props.agent.date_de_naissance)
  const today = new Date()

  const r = today.getFullYear() - birth.getFullYear()

  return r

})

</script>

<template>

<div class="bg-white shadow rounded p-4">

<h3 class="font-bold mb-3">
Informations personnelles
</h3>

<p><b>Sexe :</b> {{ agent.sexe }}</p>

<p><b>Date naissance :</b> {{ agent.date_de_naissance }}</p>

<p><b>Age :</b> {{ age }} ans</p>

<p><b>Nationalité :</b> {{ agent.nationalite }}</p>

<p><b>Adresse :</b> {{ agent.adresse }}</p>

</div>

</template>