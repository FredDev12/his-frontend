<script setup>
defineProps({
  agent: Object
})
</script>

<template>

<div class="bg-white shadow rounded p-6">

<h2 class="text-2xl font-bold">
{{ agent.prenom }} {{ agent.nom_post }}
</h2>

<p class="text-gray-500">
CAC : {{ agent.cac_id_co }}
</p>

<div class="flex gap-3 mt-3">

<span class="bg-blue-100 px-3 py-1 rounded">
{{ agent.fonction }}
</span>

<span class="bg-green-100 px-3 py-1 rounded">
{{ agent.site }}
</span>

<span class="bg-yellow-100 px-3 py-1 rounded">
{{ agent.statut }}
</span>

</div>

</div>

</template>