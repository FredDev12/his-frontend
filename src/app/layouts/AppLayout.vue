<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'

import Sidebar from '@/shared/ui/layout/Sidebar.vue'
import Topbar from '@/shared/ui/layout/Topbar.vue'

const sidebarOpen = ref(false)

function openSidebar() {
  sidebarOpen.value = true
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <Sidebar :open="sidebarOpen" @close="closeSidebar" />

    <div class="lg:pl-72">
      <Topbar @open-sidebar="openSidebar" />

      <main class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>