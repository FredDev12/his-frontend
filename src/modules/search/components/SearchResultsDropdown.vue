<script setup>
import { computed } from "vue"

const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
})

function resolveRoute(item) {
  if (item?.route) return item.route

  const id = item?.id
  if (!id) return "#"

  switch (item.type) {
    case "PATIENT":
      return `/dme/patients/${id}`
    case "EPISODE":
      return `/episodes/${id}`
    case "FACTURE":
      return `/facturation/${id}`
    case "PAIEMENT":
      return `/paiements`
    case "CONSULTATION":
      return `/consultations/${id}`
    case "EXAMEN":
      return `/examens/${id}`
    case "PRESCRIPTION":
      return `/prescriptions/${id}`
    case "HOSPITALISATION":
      return `/hospitalisation`
    case "SORTIE":
      return `/sorties/${id}`
    default:
      return "#"
  }
}

const visibleGroups = computed(() =>
  props.groups.filter((group) => Array.isArray(group.items) && group.items.length > 0),
)
</script>

<template>
  <div
    class="absolute left-0 right-0 top-full z-50 mt-2 max-h-[500px] overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl"
  >
    <div
      v-if="visibleGroups.length === 0"
      class="p-5 text-center text-sm text-slate-500"
    >
      Aucun résultat.
    </div>

    <template
      v-for="group in visibleGroups"
      :key="group.key"
    >
      <div class="border-b border-slate-100 last:border-b-0">
        <div class="bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-500">
          {{ group.label }}
        </div>

        <RouterLink
          v-for="item in group.items"
          :key="`${group.key}-${item.id}`"
          :to="resolveRoute(item)"
          class="block border-t border-slate-100 px-4 py-3 hover:bg-slate-50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-medium text-slate-950">
                {{ item.title }}
              </div>

              <div class="text-sm text-slate-500">
                {{ item.subtitle || "—" }}
              </div>
            </div>

            <span
              v-if="item.status"
              class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            >
              {{ item.status }}
            </span>
          </div>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
