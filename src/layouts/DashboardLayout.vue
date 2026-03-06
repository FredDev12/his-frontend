<script setup>

import Sidebar from "../components/layout/Sidebar.vue"
import Topbar from "../components/layout/Topbar.vue"
import router from "../router";

</script>

<template>

<div class="flex min-h-screen">

<Sidebar/>

<div class="flex-1">

<Topbar/>

<div class="p-6">

<router-view/>

</div>

</div>

</div>

</template>