<script setup>

import { useToastStore } from "../../stores/toast.store"

const toast = useToastStore()

</script>

<template>

<div class="fixed top-6 right-6 space-y-3 z-50">

<div
v-for="t in toast.toasts"
:key="t.id"
class="px-4 py-3 rounded shadow text-white"
:class="{

'bg-blue-600':t.type==='info',
'bg-green-600':t.type==='success',
'bg-red-600':t.type==='error'

}"
>

{{t.message}}

</div>

</div>

</template>