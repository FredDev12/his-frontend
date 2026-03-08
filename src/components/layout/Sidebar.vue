<script setup>
import { useRouter } from "vue-router"
import { useAuthStore } from "../../stores/auth.store"
import BaseButton from "../ui/BaseButton.vue"

const router = useRouter()
const auth = useAuthStore()

const logout = async () => {
  try {
    if (auth.logout) await auth.logout()
  } finally {
    // fallback: redirection login
    router.push("/login" )
  }
}

const profile = () => {
  router.push("/profile")
}

</script>

<template>
  <aside class="hidden md:flex w-60 bg-white border-r min-h-screen p-4 flex-col">
    <div class="space-y-4">
      <h2 class="font-bold text-lg">HIS</h2>

      <nav class="flex flex-col gap-2 text-sm">
        <router-link to="/" class="hover:text-blue-600" active-class="text-blue-600 font-medium">
          Dashboard
        </router-link>

        <router-link to="/reception" class="hover:text-blue-600" active-class="text-blue-600 font-medium">
          Réception
        </router-link>

        <router-link to="/fiches" class="hover:text-blue-600" active-class="text-blue-600 font-medium">
          Fiches de patient
        </router-link>
        
        
      </nav>
    </div>

    <!-- Logout collé en bas -->
    <div class="mt-auto pt-4 border-t">
      <div class="text-xs text-gray-500 mb-2">
        Connecté: <span class="font-medium">{{ auth.user?.prenom || "-" }}</span>
      </div>

      <!-- Lien rapide vers profil -->
      <BaseButton @click="profile"  variant="primary" class="w-full justify-center block text-xs text-blue-600 mb-2">
        Voir mon profil
      </BaseButton>

      <BaseButton variant="danger" class="w-full justify-center" @click="logout">
        Déconnexion
      </BaseButton>
    </div>
  </aside>
</template>