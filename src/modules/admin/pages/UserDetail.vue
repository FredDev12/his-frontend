<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        ← Retour
      </button>

      <h1 class="text-2xl font-bold">Détail utilisateur</h1>

      <div></div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center text-gray-500 py-10">
      Chargement...
    </div>

    <!-- CONTENT -->
    <div v-else-if="user" class="bg-white shadow rounded-xl p-6 space-y-6">

      <!-- Profil -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
          {{ initials }}
        </div>

        <div>
          <h2 class="text-xl font-semibold">
            {{ user.nom }} {{ user.prenom }}
          </h2>
          <p class="text-gray-500">{{ user.email }}</p>
        </div>
      </div>

      <!-- Infos -->
      <div class="grid md:grid-cols-2 gap-4">

        <div class="p-4 border rounded-lg">
          <p class="text-sm text-gray-500">ID</p>
          <p class="font-medium">#{{ user.id }}</p>
        </div>

        <div class="p-4 border rounded-lg">
          <p class="text-sm text-gray-500">Rôle</p>
          <span
            class="text-xs px-2 py-1 rounded"
            :class="roleClass(user.role)"
          >
            {{ user.role }}
          </span>
        </div>

        <div class="p-4 border rounded-lg">
          <p class="text-sm text-gray-500">Créé le</p>
          <p>{{ formatDate(user.created_at) }}</p>
        </div>

        <div class="p-4 border rounded-lg">
          <p class="text-sm text-gray-500">Mis à jour</p>
          <p>{{ formatDate(user.updated_at) }}</p>
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="flex gap-3 pt-4 border-t">

        <button
          @click="editMode = !editMode"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ✏️ Modifier
        </button>

        <button
          class="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          🗑️ Supprimer
        </button>

      </div>

      <!-- EDIT MODE -->
      <div v-if="editMode" class="space-y-4 pt-4 border-t">

        <h3 class="font-semibold">Modifier utilisateur</h3>

        <input v-model="form.nom" class="border p-2 w-full rounded" placeholder="Nom"/>
        <input v-model="form.prenom" class="border p-2 w-full rounded" placeholder="Prénom"/>
        <input v-model="form.email" class="border p-2 w-full rounded" placeholder="Email"/>

        <select v-model="form.role" class="border p-2 w-full rounded">
          <option value="admin">Admin</option>
          <option value="medecin">Médecin</option>
          <option value="secretaire">Secrétaire</option>
          <option value="patient">Patient</option>
        </select>

        <button
          @click="saveUser"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          💾 Enregistrer
        </button>

      </div>

    </div>

    <!-- ERROR -->
    <div v-else class="text-center text-red-500">
      Utilisateur introuvable
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAdminStore } from "../stores/admin.store"

const route = useRoute()
const router = useRouter()
const store = useAdminStore()

const user = ref(null)
const loading = ref(false)
const editMode = ref(false)

const form = ref({
  nom: "",
  prenom: "",
  email: "",
  role: ""
})

const fetchUser = async () => {
  loading.value = true
  try {
    const id = route.params.id

    // si déjà dans le store
    let found = store.users.find(u => u.id == id)

    if (!found) {
      await store.fetchUsers()
      found = store.users.find(u => u.id == id)
    }

    user.value = found

    if (found) {
      form.value = { ...found }
    }

  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)

// 🔤 Initiales
const initials = computed(() => {
  if (!user.value) return "?"
  return (
    user.value.nom?.[0] + user.value.prenom?.[0]
  ).toUpperCase()
})

// 🎨 Badge rôle
const roleClass = (role) => {
  switch (role) {
    case "admin": return "bg-purple-100 text-purple-700"
    case "medecin": return "bg-blue-100 text-blue-700"
    case "secretaire": return "bg-yellow-100 text-yellow-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

// 📅 Format date
const formatDate = (date) => {
  return date ? new Date(date).toLocaleString() : "-"
}

// 🔙 Retour
const goBack = () => {
  router.back()
}

// 💾 Save (à connecter API)
const saveUser = async () => {
  console.log("Update user:", form.value)
  editMode.value = false
}
</script>