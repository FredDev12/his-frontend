<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { getHisServiceByRoute, hisServices } from "@/shared/config/his-services.config";
import { filterAuthorizedServices } from "@/shared/rbac/permissions";

const route = useRoute();
const auth = useAuthStore();

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
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <aside class="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div class="border-b border-slate-200 px-5 py-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
          HIS CAC
        </p>

        <h1 class="mt-1 text-lg font-bold text-slate-950">
          {{ pageTitle }}
        </h1>

        <p class="mt-1 text-xs leading-5 text-slate-500">
          {{ pageDescription }}
        </p>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <RouterLink
          v-for="service in visibleServices"
          :key="service.key"
          :to="service.route"
          class="block rounded-xl px-4 py-3 text-sm font-medium transition"
          :class="
            activeService?.key === service.key
              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          "
        >
          <span class="block">{{ service.label }}</span>
          <span class="block text-xs font-normal text-slate-400">
            Étape {{ service.workflowOrder }}
          </span>
        </RouterLink>
      </nav>

      <div class="border-t border-slate-200 p-4">
        <p class="text-sm font-semibold text-slate-900">
          {{ auth.fullName }}
        </p>
        <p class="text-xs text-slate-500">
          {{ auth.user?.role?.name || "Session HIS" }}
        </p>
      </div>
    </aside>

    <div class="lg:pl-72">
      <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="flex min-h-16 items-center justify-between px-4 lg:px-8">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Service actif
            </p>
            <h2 class="text-lg font-bold text-slate-950">
              {{ pageTitle }}
            </h2>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden text-right sm:block">
              <p class="text-sm font-semibold text-slate-800">
                {{ auth.fullName }}
              </p>
              <p class="text-xs text-slate-500">
                {{ auth.roleCode || "Utilisateur" }}
              </p>
            </div>

            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
              {{ auth.fullName.slice(0, 1).toUpperCase() }}
            </div>
          </div>
        </div>
      </header>

      <main class="p-4 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
