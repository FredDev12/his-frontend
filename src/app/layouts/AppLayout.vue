<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { getHisServiceByRoute, hisServices } from "@/shared/config/his-services.config";
import { filterAuthorizedServices } from "@/shared/rbac/permissions";
import Sidebar from "@/shared/ui/layout/Sidebar.vue";
import Topbar from "@/shared/ui/layout/Topbar.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const sidebarOpen = ref(false);

const activeService = computed(() => getHisServiceByRoute(route.path));

const visibleServices = computed(() => {
  return filterAuthorizedServices(hisServices, auth.user);
});

const pageTitle = computed(() => {
  return activeService.value?.label || "Dashboard HIS";
});

const pageDescription = computed(() => {
  return activeService.value?.description || "Système hospitalier sécurisé.";
});

async function logout() {
  await auth.logout();
  await router.push("/login");
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <Sidebar
      :open="sidebarOpen"
      @close="sidebarOpen = false"
    />

    <div class="lg:pl-72">
      <Topbar
        :title="pageTitle"
        :description="pageDescription"
        @open-sidebar="sidebarOpen = true"
      />

      <main class="p-4 lg:p-8">
        <RouterView :key="route.fullPath" />
      </main>
    </div>
  </div>
</template>




