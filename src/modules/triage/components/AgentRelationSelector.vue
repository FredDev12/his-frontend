<script setup>

import { ref } from "vue"

const relation = ref("agent")

</script>

<template>

<div class="card">

<h2 class="font-semibold mb-4">

Type patient agent

</h2>

<select
v-model="relation"
class="border px-3 py-2 rounded"
>

<option value="agent">

Agent

</option>

<option value="conjoint">

Conjoint

</option>

<option value="enfant">

Enfant

</option>

</select>

</div>

</template>