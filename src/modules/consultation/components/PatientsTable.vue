<script setup>

import { ref, computed } from "vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"

const props = defineProps({
patients:Array
})

const search = ref("")
const page = ref(1)

const pageSize = 10

const filtered = computed(()=>{

return props.patients.filter(p =>
(p.nom || "").toLowerCase().includes(search.value.toLowerCase())
)

})

const paginated = computed(()=>{

const start = (page.value-1) * pageSize
return filtered.value.slice(start,start+pageSize)

})

</script>

<template>

<div class="card space-y-4">

<div class="flex justify-between">

<input
v-model="search"
placeholder="Recherche patient..."
class="border px-3 py-2 rounded"
/>

</div>

<table class="w-full border">

<thead>

<tr class="bg-gray-50">

<th>ID</th>
<th>Nom</th>
<th>Sexe</th>
<th>Urgence</th>
<th>Paiement</th>

</tr>

</thead>

<tbody>

<tr
v-for="p in paginated"
:key="p.id"
class="border-t"
>

<td>{{p.numero_patient}}</td>

<td>

{{p.nom}} {{p.prenom}}

</td>

<td>{{p.sexe}}</td>

<td>

<BaseBadge
v-if="p.urgence"
type="danger"
>

Urgence

</BaseBadge>

</td>

<td>

<BaseBadge
v-if="p.paiement_effectue"
type="success"
>

Payé

</BaseBadge>

</td>

</tr>

</tbody>

</table>

</div>

</template>