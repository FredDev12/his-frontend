<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        ← Retour
      </button>

      <h1 class="text-2xl font-bold">Créer un utilisateur</h1>

      <div></div>
    </div>

    <!-- FORM -->
    <div class="bg-white shadow rounded-xl p-6 space-y-4">

      <!-- Nom -->
      <div>
        <label class="text-sm text-gray-600">Nom</label>
        <BaseInput v-model="form.nom" class="input" />
      </div>

      <!-- Prénom -->
      <div>
        <label class="text-sm text-gray-600">Prénom</label>
        <BaseInput v-model="form.prenom" class="input" />
      </div>

      <!-- Email -->
      <div>
        <label class="text-sm text-gray-600">Email</label>
        <BaseInput v-model="form.email" type="email" class="input" />
      </div>

      <!-- Mot de passe -->
      <div>
        <label class="text-sm text-gray-600">Mot de passe</label>
        <BaseInput v-model="form.password" type="password" class="input" />
      </div>

      <div>
        <label class="text-sm text-gray-600">Mot de passe</label>
        <BaseInput v-model="form.confirmPassword" type="password" />
      </div>

      <!-- Rôle -->
      <div>
        <RadioGroup
          v-model="form.role"
          label="Choisir un rôle"
          :options="[
            { label: 'Admin', value: 'admin' },
            { label: 'Médecin', value: 'medecin' },
            { label: 'Secrétaire', value: 'secretaire' },
            { label: 'Patient', value: 'patient' }
          ]"
        />
      </div>

      <!-- ERREUR -->
      <div v-if="error" class="text-red-500 text-sm">
        {{ error }}
      </div>

      <!-- ACTIONS -->
      <div class="flex justify-end gap-3 pt-4">
        <BaseButton
          @click="goBack"
          class="px-4 py-2 bg-gray-200 rounded"
        >
          Annuler
        </BaseButton>

        <BaseButton
          @click="createUser"
          :disabled="loading || !form.email"
        >
          {{ loading ? "Création..." : "Créer" }}
        </BaseButton>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAdminStore } from "../stores/admin.store"
import { useToastStore } from "../../../stores/toast.store"
import BaseInput from "../../../components/ui/BaseInput.vue"
import BaseButton from "../../../components/ui/BaseButton.vue"
import RadioGroup from "../../../components/ui/RadioGroup.vue"

const router = useRouter()
const store = useAdminStore()
const toast = useToastStore()

const loading = ref(false)
const error = ref(null)

const form = ref({
  nom: "",
  prenom: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: ""
})

// 🔍 Validation simple
const validate = () => {
  if (!form.value.nom) return "Nom requis"
  if (!form.value.prenom) return "Prénom requis"
  if (!form.value.email) return "Email requis"
  if (!/\S+@\S+\.\S+/.test(form.value.email)) return "Email invalide"

  if (!form.value.password) return "Mot de passe requis"
  if (!form.value.password.length < 5) return "Mot de passe tropCourt"
  
  if (form.value.password !== form.value.confirmPassword)
  return "Les mots de passe ne correspondent pas"

  if (!form.value.role) return "Rôle requis"
  return null
}

// 🚀 Create
const createUser = async () => {
  error.value = validate()

  if (error.value) return

  loading.value = true

  try {
    await store.createUser(form.value)

    toast.add("Utilisateur créé avec succès", "success", "top-left", 4000)

    router.push({ name: "UsersList" })

  } catch (e) {
    error.value = "Erreur lors de la création"
    toast.add(`Erreur lors de la creation ${e}`, "error", "center", 5000)

    console.error(e)
  } finally {
    loading.value = false
  }
}

// 🔙 Retour
const goBack = () => {
  router.back()
}
</script>