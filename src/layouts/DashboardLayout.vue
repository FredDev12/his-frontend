<script setup>

import Sidebar from "../components/layout/Sidebar.vue"
import Topbar from "../components/layout/Topbar.vue"
import Breadcrumb from "../components/ui/Breadcrumb.vue";

</script>

<template>

<div class="flex h-screen overflow-hidden">

<Sidebar/>

<div class="flex-1 flex flex-col overflow-hidden">

<Topbar/>

<!-- Breadcrumb fixe -->
      <div class="px-4 py-3 bg-white border-b">
        <Breadcrumb />
      </div>

      <!-- Contenu scrollable -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <div class="p-5">
          <router-view />
        </div>
      </main>

</div>

</div>

</template>

<style scoped>
/* Pour s'assurer que le scroll fonctionne bien */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 20px;
  border: 2px solid #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>