<script setup>

const props = defineProps({
  agent: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(["select"])

const selectAgent = () => {
  emit("select", props.agent)
}

</script>

<template>

<div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">

  <div class="flex justify-between items-start">

    <div>

      <h3 class="font-semibold text-slate-800">
        {{ agent.nom_post }} {{ agent.prenom }}
      </h3>

      <p class="text-sm text-slate-500">
        CAC : {{ agent.cac_id_co }}
      </p>

      <p class="text-sm text-slate-500">
        Fonction : {{ agent.fonction }}
      </p>

      <p class="text-sm text-slate-500">
        Site : {{ agent.site }}
      </p>

      <p class="text-sm text-slate-500">
        Téléphone : {{ agent.telephone }}
      </p>

    </div>

    <button
      @click="selectAgent"
      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Voir détails
    </button>

  </div>

</div>

</template>