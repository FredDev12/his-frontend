<template>
  <div class="space-y-4">

    <!-- 🔍 SLOT FILTRES (optionnel) -->
    <slot name="filters" />

    <!-- TABLE -->
    <div class="border rounded-md overflow-hidden">
      <div class="max-h-[65vh] overflow-auto">

        <table class="w-full text-sm">

          <!-- HEADER -->
          <slot name="header" />

          <!-- BODY -->
          <tbody>
            <tr
              v-for="(item, index) in paginated"
              :key="item.id || index"
              class="border-b hover:bg-gray-50 cursor-pointer"
            >
              <slot name="row" :item="item" />
            </tr>

            <!-- Empty -->
            <tr v-if="!loading && paginated.length === 0">
              <td colspan="100%" class="p-6 text-center text-gray-500">
                Aucun résultat
              </td>
            </tr>

            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="100%" class="p-6 text-center text-gray-500">
                Chargement...
              </td>
            </tr>
          </tbody>

        </table>

      </div>
    </div>

    <!-- 📄 Pagination -->
    <div class="flex justify-between items-center">

      <span class="text-sm text-gray-600">
        {{ start + 1 }} - {{ end }} / {{ data.length }}
      </span>

      <div class="flex gap-2">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Précédent
        </button>

        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  pageSize: {
    type: Number,
    default: 10
  }
})

const page = ref(1)

const totalPages = computed(() =>
  Math.ceil(props.data.length / props.pageSize)
)

const start = computed(() => (page.value - 1) * props.pageSize)

const end = computed(() =>
  Math.min(start.value + props.pageSize, props.data.length)
)

const paginated = computed(() =>
  props.data.slice(start.value, end.value)
)

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

watch(() => props.data, () => {
  page.value = 1
})
</script>