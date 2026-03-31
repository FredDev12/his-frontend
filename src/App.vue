<script setup>
import ToastHost from "./components/ui/ToastHost.vue"
import GlobalLoader from "./components/ui/GlobalLoader.vue"

import { useLoaderStore } from "./stores/loader.store"

const loader = useLoaderStore()

</script>

<template>

<div class="min-h-screen bg-gray-50 text-gray-900">

<router-view />

<ToastHost/>
<GlobalLoader v-if="loader.loading"/>

</div>

</template>