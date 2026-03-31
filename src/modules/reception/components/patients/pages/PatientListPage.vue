<template>
  <div class="p-6 space-y-4">

    <!-- HEADER -->
    <div class="flex justify-between items-center">

      <div>
        <h1 class="text-2xl font-bold">Liste des patients</h1>
        <p class="text-sm text-gray-500">
          Clique sur un patient pour voir le détail
        </p>
      </div>

      <div class="flex gap-2">
        <BaseButton @click="goFiche">
          + Nouveau patient
        </BaseButton>

        <BaseButton variant="secondary" :loading="loading" @click="fetchPatients">
          Actualiser
        </BaseButton>
      </div>

    </div>

    <!-- RECHERCHE -->
    <div class="card p-4">
      <BaseInput
        v-model="q"
        placeholder="Rechercher par nom, prénom ou téléphone..."
      />
    </div>

    <!-- TABLE -->
    <BaseTable :data="filtered" :loading="loading">

      <!-- HEADER -->
      <template #header>
        <thead class="bg-gray-50 sticky top-0">
          <tr>
            <th class="p-3">ID</th>
            <th class="p-3">Nom</th>
            <th class="p-3">Téléphone</th>
            <th class="p-3">Date</th>
          </tr>
        </thead>
      </template>

      <!-- ROW -->
      <template #row="{ item }">
        <td colspan="4" class="p-0">
          <div
            class="grid grid-cols-4 p-3 hover:bg-gray-50 cursor-pointer"
            @click="openDetail(item.id)"
          >
            <div>#{{ item.id }}</div>
            <div>{{ item.nom }} {{ item.prenom }}</div>
            <div>{{ item.telephone || "-" }}</div>
            <div>
              {{ item.created_at 
                ? new Date(item.created_at).toLocaleString() 
                : "-" }}
            </div>
          </div>
        </td>
      </template>

    </BaseTable>

    <!-- FOOTER ACTION -->
    <div>
      <BaseButton variant="secondary" @click="goBack">
        ← Retour
      </BaseButton>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

import BaseTable from '../../../../../components/ui/BaseTable.vue'
import BaseButton from '../../../../../components/ui/BaseButton.vue'
import BaseInput from '../../../../../components/ui/BaseInput.vue'

const emit = defineEmits(["back"])
const router = useRouter()

const loading = ref(false)
const patients = ref([])
const q = ref("")

// 🔄 Fake API
const fetchPatients = async () => {
  loading.value = true

  setTimeout(() => {
    patients.value = [
      { id: 1, nom: "Dupont", prenom: "Jean", telephone: "123456789" },
      { id: 2, nom: "Martin", prenom: "Sophie", telephone: "987654321" }
    ]
    loading.value = false
  }, 500)
}

onMounted(fetchPatients)

// 🔍 Filtre
const filtered = computed(() => {
  if (!q.value) return patients.value

  const term = q.value.toLowerCase()

  return patients.value.filter(p =>
    [p.nom, p.prenom, p.telephone]
      .some(v => String(v || "").toLowerCase().includes(term))
  )
})

// 🔙 Retour
function goBack() {
  emit("back")
}

// ➕ Nouveau patient
function goFiche() {
  router.push({ name: "PersonCreate" })
}

// 🔍 Détail
function openDetail(id) {
  router.push(`/persons/${id}`)
}
</script>