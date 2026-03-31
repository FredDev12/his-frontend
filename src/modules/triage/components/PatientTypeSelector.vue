<script setup>

defineProps({
modelValue:String
})

defineEmits(["update:modelValue"])

</script>

<template>

<div class="card">

<h2 class="font-semibold mb-4">

Type patient

</h2>

<div class="flex gap-6">

<label>

<input
type="radio"
value="agent"
:checked="modelValue==='agent'"
@change="$emit('update:modelValue','agent')"
/>

Agent CAC

</label>

<label>

<input
type="radio"
value="public"
:checked="modelValue==='public'"
@change="$emit('update:modelValue','public')"
/>

Public

</label>

</div>

</div>

</template>