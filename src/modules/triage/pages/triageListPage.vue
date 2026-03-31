<template>
  <div class="p-6 space-y-4">
    
    <!-- HEADER -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Toutes les fiches</h1>
        <p class="text-sm text-gray-500">Clique sur une fiche pour ouvrir le détail.</p>
      </div>

      <BaseButton variant="secondary" :loading="loading" @click="fetchAll">
        Actualiser
      </BaseButton>
    </div>

    <!-- RECHERCHE + FILTRES -->
    <div class="card space-y-3">
      
      <div class="flex flex-col md:flex-row items-end gap-3">
        
        <div class="flex-1">
          <label class="text-sm text-gray-600">Recherche</label>
          <BaseInput v-model="q" placeholder="Nom / téléphone / numéro patient..." />
        </div>

        <!-- Filtre paiement -->
        <div>
          <label class="text-sm text-gray-600">Paiement</label>
          <select v-model="filterPaiement" class="px-3 py-2 border rounded">
            <option value="">Tous</option>
            <option value="paid">Payé</option>
            <option value="unpaid">Non payé</option>
          </select>
        </div>

        <BaseBadge type="primary">
          {{ filtered.length }} fiche(s)
        </BaseBadge>

      </div>

      <!-- TABLE -->
      <BaseTable :data="filtered" :pageSize="10">

        <!-- HEADER -->
        <template #header>
          <thead class="bg-gray-50 text-gray-600 sticky top-0 z-10">
            <tr class="text-left">
              <th class="p-3">ID</th>
              <th class="p-3">Nom</th>
              <th class="p-3">Numéro</th>
              <th class="p-3">Téléphone</th>
              <th class="p-3">Paiement</th>
              <th class="p-3">Créé</th>
            </tr>
          </thead>
        </template>

        <!-- ROW -->
        <template #row="{ item }">
          <td class="p-3 font-medium cursor-pointer" @click="openDetail(item.id)">
            #{{ item.id }}
          </td>

          <td class="p-3 cursor-pointer" @click="openDetail(item.id)">
            {{ item.nom || "-" }} {{ item.prenom || "" }}
          </td>

          <td class="p-3">{{ item.numero_patient || "-" }}</td>

          <td class="p-3">{{ item.telephone || "-" }}</td>

          <td class="p-3">
            <span
              class="text-xs px-2 py-1 rounded"
              :class="item.paiement_effectue 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'"
            >
              {{ item.paiement_effectue ? "PAYÉ" : "NON" }}
            </span>
          </td>

          <td class="p-3 text-gray-600">
            {{ item.created_at 
              ? new Date(item.created_at).toLocaleString() 
              : "-" }}
          </td>
        </template>

      </BaseTable>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useToastStore } from "../../../stores/toast.store"
import { useTriageStore } from "../stores/triage.store"

import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"
import BaseTable from "../../../components/ui/BaseTable.vue"

const router = useRouter()
const toast = useToastStore()
const patient = useTriageStore()

const loading = ref(false)
const patients = ref([])
const q = ref("")
const filterPaiement = ref("")

const normalize = (s) => (s || "").toString().trim().toLowerCase()

const fetchAll = async () => {
  loading.value = true
  try {
    await patient.fetchPatients()
    patients.value = patient.patients || []
  } catch (e) {
    patients.value = []
    toast.add(`Impossible de charger les fiches ${e}`, "error")
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

// 🔍 Filtrage complet
const filtered = computed(() => {
  const term = normalize(q.value)

  let result = [...patients.value]

  // Recherche
  if (term) {
    result = result.filter(p =>
      normalize(p.nom).includes(term) ||
      normalize(p.prenom).includes(term) ||
      normalize(p.telephone).includes(term) ||
      normalize(p.numero_patient).includes(term)
    )
  }

  // Filtre paiement
  if (filterPaiement.value === "paid") {
    result = result.filter(p => p.paiement_effectue)
  }

  if (filterPaiement.value === "unpaid") {
    result = result.filter(p => !p.paiement_effectue)
  }

  return result
})

const openDetail = (id) => {
  router.push({ name: "PatientDetail", params: { id } })
}
</script>