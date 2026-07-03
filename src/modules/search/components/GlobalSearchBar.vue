<script setup>
import { ref, watch } from "vue"
import { useSearchStore } from "@/modules/search/stores/search.store"
import SearchResultsDropdown from "./SearchResultsDropdown.vue"

const store = useSearchStore()

const query = ref("")
let timer = null

watch(query, (value) => {

  clearTimeout(timer)

  timer = setTimeout(() => {

    if (!value.trim()) {

      store.clear()
      return

    }

    store.search(value)

  },300)

})
</script>

<template>

<div class="relative w-full max-w-xl">

<input
v-model="query"
type="text"
placeholder="Rechercher un patient, facture, épisode..."
class="w-full rounded-xl border px-4 py-2"
/>

<div
v-if="store.loading"
class="absolute right-3 top-2 text-xs text-slate-500"
>

Recherche...

</div>

<SearchResultsDropdown
v-if="store.hasSearched"
:groups="store.groupedResults"
/>

</div>

</template>
