<script setup>

const props = defineProps({

type:{
type:String,
default:"primary"
},
size: {
    type: String,
    default: "md" // md ou sm
  }

})

const colors={

primary:"bg-blue-100 text-blue-700",
success:"bg-green-100 text-green-700",
danger:"bg-red-100 text-red-700",
warning:"bg-yellow-100 text-yellow-700"

}

const sizes = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-1 text-xs"
}

</script>

<template>

<span
class="rounder font-medium inline-flex items-center"
:class="[colors[type], sizes[size]]"
>

<slot/>

</span>

</template>