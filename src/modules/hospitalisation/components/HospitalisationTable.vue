<script setup>
import BaseButton from "@/shared/ui/base/BaseButton.vue"
import HospitalisationStatusBadge from "@/modules/hospitalisation/components/HospitalisationStatusBadge.vue"

defineProps({
  hospitalisations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  canDischarge: { type: Boolean, default: false },
})

defineEmits(["discharge"])
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div v-if="loading" class="p-6 text-center text-sm text-slate-500">
      Chargement des hospitalisations...
    </div>

    <table v-else class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Patient</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Service</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Lit</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100">
        <tr v-if="hospitalisations.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
            Aucune hospitalisation chargée.
          </td>
        </tr>

        <tr v-for="item in hospitalisations" :key="item.id">
          <td class="px-4 py-4 text-sm font-medium text-slate-950">
            {{ item.hospitalisationCode }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ [item.nom, item.postnom, item.prenom].filter(Boolean).join(" ") || "Patient" }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ item.serviceName }}
          </td>

          <td class="px-4 py-4 text-sm text-slate-600">
            {{ item.bedNumber }}
          </td>

          <td class="px-4 py-4 text-sm">
            <HospitalisationStatusBadge :status="item.status" />
          </td>

          <td class="px-4 py-4 text-right">
            <BaseButton
              v-if="canDischarge && ['ACTIVE', 'ADMISE', 'EN_COURS'].includes(String(item.status).toUpperCase())"
              variant="warning"
              size="sm"
              @click="$emit('discharge', item)"
            >
              Sortie
            </BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
