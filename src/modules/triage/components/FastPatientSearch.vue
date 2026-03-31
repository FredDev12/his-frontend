<script setup>

import { ref, watch } from "vue"
import { searchPatients } from "../../../api/patients.api"

const query = ref("")
const results = ref([])

let timeout

watch(query,(value)=>{

clearTimeout(timeout)

timeout = setTimeout(async()=>{

if(value.length < 2) return

const res = await searchPatients(value)

results.value = res.data.data

},300)

})

</script>

<template>

<div class="card">

<input
v-model="query"
placeholder="Recherche rapide patient..."
class="border px-3 py-2 w-full"
/>

<div
v-for="p in results"
:key="p.id"
class="border p-2 mt-2 rounded"
>

{{p.nom}} {{p.prenom}}

</div>

</div>

</template>