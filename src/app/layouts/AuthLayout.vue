<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <div class="grid min-h-screen lg:grid-cols-2">
      <section
        class="hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div>
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold">
              HC
            </div>

            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-blue-100">
                Hôpital CAC
              </p>
              <h1 class="text-2xl font-semibold">
                Système d’Information Hospitalier
              </h1>
            </div>
          </div>

          <div class="mt-24 max-w-xl">
            <p class="text-sm font-medium uppercase tracking-[0.3em] text-blue-200">
              Interface clinique
            </p>

            <h2 class="mt-4 text-4xl font-semibold leading-tight">
              Une plateforme claire pour suivre le patient de l’accueil à la sortie.
            </h2>

            <p class="mt-6 text-base leading-7 text-blue-100">
              Réception, triage, consultation, examens, pharmacie, caisse,
              facturation, sortie et audit dans une interface unique.
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
          <p class="text-sm text-blue-100">
            Accès sécurisé · Traçabilité · Rôles et permissions · Workflow patient
          </p>
        </div>
      </section>

      <section class="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <RouterView />
      </section>
    </div>
  </main>
</template>