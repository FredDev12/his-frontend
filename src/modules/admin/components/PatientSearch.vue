<script setup>
import { ref, watch, computed, nextTick } from "vue"
import { searchPatients } from "../../../api/patients.api"
import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import { useToastStore } from "../../../stores/toast.store"

const toast = useToastStore()
const emit = defineEmits(["selectPatient"])

const query = ref("")
const searching = ref(false)
const results = ref([])
const hasSearched = ref(false)

const activeIndex = ref(-1)
const showList = ref(false)

let t = null
let requestId = 0 // anti-race condition

const MAX_RESULTS = 5

const normalize = (q) => (q || "").toString().trim().replace(/\s+/g, " ")
const digitsOnly = (s) => (s || "").toString().replace(/\D/g, "")
const normalizePhone = (s) => {
  const d = digitsOnly(s)
  if (!d) return ""
  if (d.startsWith("243") && d.length >= 12) return "0" + d.slice(3)
  return d
}

const uniqueById = (arr) => {
  const map = new Map()
  for (const p of arr || []) {
    if (!p?.id) continue
    map.set(p.id, p)
  }
  return Array.from(map.values())
}

const runSearch = async (q) => {
  const res = await searchPatients(q)
  return res?.data?.data || []
}

const smartSearch = async (raw) => {
  const q = normalize(raw)
  const merged = []

  merged.push(...(await runSearch(q)))

  if (merged.length === 0) {
    const phone = normalizePhone(q)
    if (phone && phone.length >= 6) merged.push(...(await runSearch(phone)))
  }

  if (merged.length === 0) {
    const tokens = q.split(" ").map((x) => x.trim()).filter((x) => x.length >= 3)
    for (const tok of tokens.slice(0, 3)) merged.push(...(await runSearch(tok)))
  }

  return uniqueById(merged)
}

const topResults = computed(() => (results.value || []).slice(0, MAX_RESULTS))

const pick = (p) => {
  if (!p) return
  emit("selectPatient", p)
  showList.value = false
  activeIndex.value = -1

  query.value = ""
}

const openList = () => {
  if (topResults.value.length > 0) showList.value = true
}

const closeList = () => {
  showList.value = false
  activeIndex.value = -1
}

const setActive = (idx) => {
  activeIndex.value = idx
}

const ensureActiveVisible = async () => {
  await nextTick()
  const el = document.getElementById(`ps-opt-${activeIndex.value}`)
  el?.scrollIntoView?.({ block: "nearest" })
}

/**
 * Surbrillance
 * - on découpe la query en mots
 * - on wrap chaque occurrence avec <mark>
 */
const escapeHtml = (str) =>
  (str || "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const highlight = (text, q) => {
  const raw = (text ?? "").toString()
  const safeText = escapeHtml(raw)

  const nq = normalize(q)
  if (!nq || nq.length < 2) return safeText

  const tokens = nq
    .split(" ")
    .map((x) => x.trim())
    .filter((x) => x.length >= 2)

  if (tokens.length === 0) return safeText

  // regex OR (case-insensitive)
  const pattern = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  const re = new RegExp(`(${pattern})`, "gi")

  return safeText.replace(re, `<mark class="px-1 rounded bg-yellow-200">$1</mark>`)
}

watch(query, (val) => {
  clearTimeout(t)
  t = setTimeout(async () => {
    const q = normalize(val)
    if (!q || q.length < 2) {
      results.value = []
      hasSearched.value = false
      closeList()
      return
    }
    await search()
  }, 220)
})

const search = async () => {
  const q = normalize(query.value)

  if (q.length < 2) {
    results.value = []
    hasSearched.value = true
    closeList()
    toast.add("Tape au moins 2 caractères", "info")
    return
  }

  searching.value = true
  hasSearched.value = true

  const myId = ++requestId

  try {
    const data = await smartSearch(q)

    if (myId !== requestId) return

    results.value = data
    activeIndex.value = data.length ? 0 : -1
    showList.value = data.length > 0
  } catch (error) {
    if (myId !== requestId) return
    results.value = []
    closeList()
    toast.add("Erreur lors de la recherche de patients", "error")
  } finally {
    if (myId === requestId) searching.value = false
  }
}

const onKeydown = async (e) => {
  if (!showList.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    openList()
    return
  }

  if (!showList.value) {
    if (e.key === "Enter") {
      e.preventDefault()
      await search()
    }
    return
  }

  if (e.key === "Escape") {
    e.preventDefault()
    closeList()
    return
  }

  if (e.key === "ArrowDown") {
    e.preventDefault()
    const max = topResults.value.length - 1
    if (max < 0) return
    activeIndex.value = Math.min(activeIndex.value + 1, max)
    await ensureActiveVisible()
    return
  }

  if (e.key === "ArrowUp") {
    e.preventDefault()
    const max = topResults.value.length - 1
    if (max < 0) return
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    await ensureActiveVisible()
    return
  }

  if (e.key === "Enter") {
    e.preventDefault()
    const p = topResults.value[activeIndex.value]
    pick(p)
  }
}

const onBlur = () => {
  // petit délai pour laisser le click sur un résultat
  setTimeout(() => closeList(), 120)
}
</script>

<template>
  <div class="card space-y-3 relative">
    <div class="flex items-end gap-3">
      <div class="flex-1">
        <label class="text-sm text-gray-600">Rechercher patient</label>

        <BaseInput
          v-model="query"
          placeholder="Nom / téléphone / numéro patient"
          @focus="openList"
          @blur="onBlur"
          @keydown="onKeydown"
        />
      </div>

      <BaseButton variant="primary" @click="search" :loading="searching">
        Rechercher
      </BaseButton>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500">
      <span v-if="hasSearched && !searching">
        {{ results.length }} résultat(s) • Affichage Top {{ MAX_RESULTS }}
      </span>
      <span v-if="searching">Recherche…</span>
      <span v-if="showList" class="text-gray-400">↑ ↓ Enter • Esc</span>
    </div>

    <div
        v-if="showList && topResults.length > 0"
        class="border rounded-md max-h-72 overflow-y-auto"
    >
      <button
        v-for="(p, idx) in topResults"
        :key="p.id"
        :id="`ps-opt-${idx}`"
        type="button"
        class="w-full text-left px-3 py-3 border-b last:border-b-0 hover:bg-gray-50"
        :class="idx === activeIndex ? 'bg-blue-50' : ''"
        @mouseenter="setActive(idx)"
        @mousedown.prevent="pick(p)"
      >
        <div class="font-semibold">
          <span v-html="highlight(`${p.nom || ''} ${p.prenom && p.prenom !== 'null' ? p.prenom : ''}`.trim(), query)"></span>
          <span class="text-xs text-gray-500"> (#{{ p.id }})</span>
        </div>

        <div class="text-xs text-gray-600">
          <span v-html="highlight(`Num: ${p.numero_patient || '-'}`, query)"></span>
          <span class="mx-2">•</span>
          <span v-html="highlight(`Tel: ${p.telephone && p.telephone !== 'null' ? p.telephone : '-'}`, query)"></span>
        </div>
      </button>
    </div>

    <div v-else-if="hasSearched && !searching" class="text-sm text-gray-500">
      Aucun résultat
    </div>
  </div>
</template>