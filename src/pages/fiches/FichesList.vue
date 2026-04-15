<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getPatients } from "../../api/patients.api"
import { useToastStore } from "../../stores/toast.store"
import { usePatientsStore } from "../../modules/reception/components/patients/stores/patients.store"

import BaseInput from "../../components/ui/BaseInput.vue"
import BaseButton from "../../components/ui/BaseButton.vue"
import BaseBadge from "../../components/ui/BaseBadge.vue"

const router = useRouter()
const toast = useToastStore()
const patient = usePatientsStore()

const loading = ref(false)
const patients = ref([])
const q = ref("")

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

const filtered = computed(() => {
  const query = normalize(q.value)
  if (!query) return patients.value

  return (patients.value || []).filter((p) => {
    const name = `${p.nom || ""} ${p.prenom || ""} ${p.postnom || ""}`
    const tel = `${p.telephone || ""}`
    const num = `${p.numero_patient || ""}`
    return (
      normalize(name).includes(query) ||
      normalize(tel).includes(query) ||
      normalize(num).includes(query)
    )
  })
})

const openDetail = (id) => {
  router.push({ name: "fiches.detail", params: { id } })
}
</script>

<template>
  <div class="p-6 space-y-4">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Toutes les fiches</h1>
        <p class="text-sm text-gray-500">Clique sur une fiche pour ouvrir le détail.</p>
      </div>

      <BaseButton variant="secondary" :loading="loading" @click="fetchAll">
        Actualiser
      </BaseButton>
    </div>

    <div class="card space-y-3">
      <div class="flex items-end gap-3">
        <div class="flex-1">
          <label class="text-sm text-gray-600">Recherche</label>
          <BaseInput v-model="q" placeholder="Nom / téléphone / numéro patient..." />
        </div>

        <BaseBadge type="primary">{{ filtered.length }} fiche(s)</BaseBadge>
      </div>

      <!-- TABLE SCROLL -->
      <div class="border rounded-md overflow-hidden">
        <div class="max-h-[65vh] overflow-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-white z-10 border-b">
              <tr class="text-left text-gray-600">
                <th class="p-3">ID</th>
                <th class="p-3">Nom</th>
                <th class="p-3">Numéro</th>
                <th class="p-3">Téléphone</th>
                <th class="p-3">Paiement</th>
                <th class="p-3">Créé</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="p in filtered"
                :key="p.id"
                class="border-b hover:bg-gray-50 cursor-pointer"
                @click="openDetail(p.id)"
              >
                <td class="p-3 font-medium">#{{ p.id }}</td>
                <td class="p-3">
                  {{ p.nom || "-" }} {{ p.prenom || "" }}
                </td>
                <td class="p-3">{{ p.numero_patient || "-" }}</td>
                <td class="p-3">{{ p.telephone || "-" }}</td>
                <td class="p-3">
                  <span
                    class="text-xs px-2 py-1 rounded"
                    :class="p.paiement_effectue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ p.paiement_effectue ? "PAYÉ" : "NON" }}
                  </span>
                </td>
                <td class="p-3 text-gray-600">
                  {{ p.created_at ? new Date(p.created_at).toLocaleString() : "-" }}
                </td>
              </tr>

              <tr v-if="!loading && filtered.length === 0">
                <td colspan="6" class="p-6 text-center text-gray-500">
                  Aucune fiche trouvée
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="6" class="p-6 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>