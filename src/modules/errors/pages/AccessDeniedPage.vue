<script setup>
defineOptions({ name: "AccessDeniedPage" });

import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { getDefaultRoute } from "@/shared/rbac/default-route";

const auth = useAuthStore();
const router = useRouter();

const roleLabel = computed(() => {
  const role = String(auth.role || "").trim();

  return role || "non défini";
});

async function goToAuthorizedArea() {
  const destination = getDefaultRoute(auth);

  if (destination === "/acces-refuse") {
    return;
  }

  await router.push(destination);
}

async function logout() {
  await auth.logout();
  await router.push("/login");
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <section
      class="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      aria-labelledby="access-denied-title"
    >
      <div
        class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl font-bold text-red-700"
        aria-hidden="true"
      >
        !
      </div>

      <p class="text-sm font-semibold uppercase tracking-wider text-red-700">
        Autorisation insuffisante
      </p>

      <h1
        id="access-denied-title"
        class="mt-2 text-2xl font-bold text-slate-950"
      >
        Accès refusé
      </h1>

      <p class="mt-4 leading-7 text-slate-600">
        Vous êtes authentifié, mais votre compte ne dispose d’aucune autorisation
        permettant d’ouvrir cette fonctionnalité.
      </p>

      <dl class="mt-6 rounded-2xl bg-slate-50 p-4">
        <div class="flex items-center justify-between gap-4">
          <dt class="text-sm font-medium text-slate-500">Utilisateur</dt>
          <dd class="text-right text-sm font-semibold text-slate-900">
            {{ auth.fullName }}
          </dd>
        </div>

        <div class="mt-3 flex items-center justify-between gap-4">
          <dt class="text-sm font-medium text-slate-500">Rôle</dt>
          <dd class="text-right text-sm font-semibold capitalize text-slate-900">
            {{ roleLabel }}
          </dd>
        </div>
      </dl>

      <p class="mt-5 text-sm leading-6 text-slate-500">
        Contactez l’administrateur HIS si cet accès est nécessaire à votre
        activité professionnelle. Une permission ne doit pas être contournée.
      </p>

      <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="logout"
        >
          Se déconnecter
        </button>

        <button
          type="button"
          class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="getDefaultRoute(auth) === '/acces-refuse'"
          @click="goToAuthorizedArea"
        >
          Ouvrir mon espace autorisé
        </button>
      </div>
    </section>
  </main>
</template>
