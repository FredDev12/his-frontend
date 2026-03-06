<script setup>

const props = defineProps({

type:{
type:String,
default:"primary"
}

})

const colors={

primary:"bg-blue-100 text-blue-700",
success:"bg-green-100 text-green-700",
danger:"bg-red-100 text-red-700",
warning:"bg-yellow-100 text-yellow-700"

}

</script>

<template>

<span
class="px-2 py-1 rounded text-xs"
:class="colors[type]"
>

<slot/>

</span>

</template>