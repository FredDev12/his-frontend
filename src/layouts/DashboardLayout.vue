<script setup>

import Sidebar from "../components/layout/Sidebar.vue"
import Topbar from "../components/layout/Topbar.vue"
import router from "../router";
import Breadcrumb from "../components/ui/Breadcrumb.vue";

</script>

<template>

<div class="flex min-h-screen">

<Sidebar/>

<div class="flex-1 flex flex-col">

<Topbar/>

<main class="flex-1 p-6">
  <Breadcrumb/>

  <router-view/>
</main>

<div class="p-6">


</div>

</div>

</div>

</template>