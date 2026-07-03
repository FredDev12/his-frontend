<script setup>
import BaseButton from "@/shared/ui/base/BaseButton.vue"

defineProps({
  sorties: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div v-if="loading" class="p-6 text-center text-sm text-slate-500">
      Chargement des sorties...
    </div>

    <table v-else class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Patient</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Fiche</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="sorties.length === 0">
          <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucune sortie chargée.
          </td>
        </tr>

        <tr v-for="sortie in sorties" :key="sortie.id">
          <td class="px-4 py-4 text-sm font-medium text-slate-950">{{ sortie.sortieCode }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">
            {{ [sortie.nom, sortie.postnom, sortie.prenom].filter(Boolean).join(" ") || "Patient" }}
          </td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ sortie.numero_fiche }}</td>
          <td class="px-4 py-4 text-sm text-slate-600">{{ sortie.status }}</td>
          <td class="px-4 py-4 text-right">
            <RouterLink :to="`/sorties/${sortie.id}`">
              <BaseButton variant="secondary" size="sm">Voir</BaseButton>
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
