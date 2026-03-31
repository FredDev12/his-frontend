<template>
  <div class="p-6 space-y-4">
    
    <!-- HEADER -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Tous les utilisateurs</h1>
        <p class="text-sm text-gray-500">Clique sur un utilisateur pour voir le détail.</p>
      </div>

      <BaseButton variant="secondary" :loading="loading" @click="fetchAll">
        Actualiser
      </BaseButton>
    </div>

    <!-- RECHERCHE + FILTRE -->
    <div class="card space-y-3">
      
        
      <div class="flex flex-col md:flex-row items-end gap-3">

          <!-- Recherche -->
        <div class="flex-1">
          <label class="text-sm text-gray-600">Recherche</label>
          <BaseInput v-model="q" placeholder="Rechercher par nom, prenom ou email ..." />
        </div>

        <!-- Filtre rôle -->
        <div>
          <label class="text-sm text-gray-600">Rôle</label>
          <select v-model="roleFilter" class="px-3 py-2 border rounded">
            <option value="">Tous</option>
            <option value="admin">Admin</option>
            <option value="medecin">Médecin</option>
            <option value="secretaire">Secrétaire</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        
      </div>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Tous les utilisateurs</h1>
          <p class="text-sm text-gray-500">
            Clique sur un utilisateur pour voir le détail.
          </p>
        </div>

        <div class="flex gap-2">
          <BaseButton @click="$router.push('/users/create')">
            + Nouvel utilisateur
          </BaseButton>

          <BaseButton variant="secondary" :loading="loading" @click="fetchAll">
            Actualiser
          </BaseButton>
        </div>
      </div>

      

      <!-- TABLE -->
      <BaseTable :data="filtered" :pageSize="10" :loading="loading">
       

        <!-- HEADER -->
        <template #header>
          <thead class="bg-gray-50 text-gray-600 sticky top-0 z-10">
            <tr class="text-left">
              <th class="p-3">ID</th>
              <th class="p-3">Nom</th>
              <th class="p-3">Email</th>
              <th class="p-3">Rôle</th>
              <th class="p-3">Statut</th>
            </tr>
          </thead>
        </template>

        <!-- ROW -->
        <template #row="{ item }">
          <td class="p-3 font-medium cursor-pointer" @click="openDetail(item.id)">
            #{{ item.id }}
          </td>

          <td class="p-3 cursor-pointer" @click="openDetail(item.id)">
            {{ item.nom }} {{ item.prenom }}
          </td>

          <td class="p-3" @click="openDetail(item.id)">{{ item.email }}</td>

          <!-- Badge rôle -->
          <td class="p-3">
            <span
              class="text-xs px-2 py-1 rounded"
              :class="roleClass(item.role)"
              @click="openDetail(item.id)"
            >
              {{ item.role }}
            </span>
          </td>

          <!-- Statut (optionnel si actif) -->
          <td class="p-3">
            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
              Actif
            </span>
          </td>
        </template>

      </BaseTable>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { useAdminStore } from "../stores/admin.store"
import { useToastStore } from "../../../stores/toast.store"

import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import BaseBadge from "../../../components/ui/BaseBadge.vue"
import BaseTable from "../../../components/ui/BaseTable.vue"

const router = useRouter()
const toast = useToastStore()
const users = useAdminStore()

const loading = ref(false)
const user = computed(() => users.users || [])
const q = ref("")
const roleFilter = ref("")

const normalize = (s) => (s || "").toString().trim().toLowerCase()

const fetchAll = async () => {
  loading.value = true
  try {
    await users.fetchUsers()
  } catch (e) {
    user.value = []
    toast.add(`Impossible de charger les users ${e}`, "error", "top-left", 4000)
  } finally {
    loading.value = false
  }
}

onMounted(() =>{
  fetchAll()
  //console.log("users: ", user.value);
  
})

watch([q, roleFilter], () => {
  // reset logique si besoin
})

// 🔍 Filtrage
const filtered = computed(() => {
  const term = normalize(q.value)

  let result = [...user.value]

  console.log("filtre result :", result);
  

  // Recherche
  if (term) {
    result = result.filter(u =>
      normalize(u.nom).includes(term) ||
      normalize(u.prenom).includes(term) ||
      normalize(u.email).includes(term)
    )
  }

  // Filtre rôle
  if (roleFilter.value) {
    result = result.filter(u => u.role === roleFilter.value)
  }

  return result
})

// 🎨 Couleur rôle
const roleClass = (role) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700"
    case "medecin":
      return "bg-blue-100 text-blue-700"
    case "secretaire":
      return "bg-yellow-100 text-yellow-700"
    case "patient":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100"
  }
}

const openDetail = (id) => {
  router.push({ name: "UsersDetail", params: { id } })
}
</script>
