<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import { getHisServiceByRoute, hisServices } from "@/shared/config/his-services.config";
import { filterAuthorizedServices } from "@/shared/rbac/permissions";

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
});

const route = useRoute();

const activeService = computed(() => getHisServiceByRoute(route.path));

const visibleServices = computed(() => {
  return filterAuthorizedServices(hisServices, props.user);
});
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <aside class="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:block">
      <div class="border-b border-slate-200 px-5 py-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          HIS CAC
        </p>
        <h1 class="mt-1 text-lg font-bold text-slate-950">
          {{ activeService?.label || "Système hospitalier" }}
        </h1>
        <p class="mt-1 text-xs text-slate-500">
          {{ activeService?.description || "Workflow clinique sécurisé" }}
        </p>
      </div>

      <nav class="space-y-1 p-3">
        <RouterLink
          v-for="service in visibleServices"
          :key="service.key"
          :to="service.route"
          class="block rounded-xl px-4 py-3 text-sm font-medium transition"
          :class="
            activeService?.key === service.key
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          "
        >
          <span class="block">{{ service.label }}</span>
          <span class="block text-xs font-normal text-slate-400">
            Étape {{ service.workflowOrder }}
          </span>
        </RouterLink>
      </nav>
    </aside>

    <div class="lg:pl-72">
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="flex min-h-16 items-center justify-between px-4 lg:px-8">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Service actif
            </p>
            <h2 class="text-lg font-bold text-slate-950">
              {{ activeService?.label || "Dashboard" }}
            </h2>
          </div>

          <div class="text-right">
            <p class="text-sm font-semibold text-slate-800">
              {{ user?.firstName || "Utilisateur" }} {{ user?.lastName || "" }}
            </p>
            <p class="text-xs text-slate-500">
              {{ user?.role?.name || "Session sécurisée" }}
            </p>
          </div>
        </div>
      </header>

      <main class="p-4 lg:p-8">
        <slot :active-service="activeService" :services="visibleServices" />
      </main>
    </div>
  </div>
</template>
