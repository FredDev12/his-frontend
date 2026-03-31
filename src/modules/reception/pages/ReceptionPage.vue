<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">
          Poste de réception
        </h1>
        <p class="text-gray-500">
          Gestion des patients et des agents
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-sm text-gray-500">Aujourd’hui</p>
          <p class="font-semibold">
            {{ new Date().toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>

    <!-- CONTENU -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ACTION PRINCIPALE -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow p-6">

        <template v-if="!typePatient">
          
          <h2 class="text-xl font-semibold mb-4">
            Que souhaitez-vous faire ?
          </h2>

          <div class="grid md:grid-cols-2 gap-4">

            <!-- PATIENT PUBLIC -->
            <div
              @click="setTypePatient('PUBLIC')"
              class="p-5 rounded-xl border hover:shadow-lg cursor-pointer transition bg-gray-50 hover:bg-white"
            >
              <div class="text-3xl mb-2">👤</div>
              <h3 class="font-semibold text-lg">Patient public</h3>
              <p class="text-sm text-gray-500">
                Consulter ou enregistrer un patient
              </p>
            </div>

            <!-- AGENT -->
            <div
              @click="setTypePatient('AGENT')"
              class="p-5 rounded-xl border hover:shadow-lg cursor-pointer transition bg-gray-50 hover:bg-white"
            >
              <div class="text-3xl mb-2">🧑‍⚕️</div>
              <h3 class="font-semibold text-lg">Agent / Personnel</h3>
              <p class="text-sm text-gray-500">
                Rechercher un agent hospitalier
              </p>
            </div>

          </div>

        </template>

        <!-- 🔁 CONTENU DYNAMIQUE -->
        <component 
          v-else 
          :is="currentComponent"
          @back="handleBack"
        />

      </div>

      <!-- PANNEAU DROIT -->
      <div class="space-y-6">

        <!-- STATS -->
        <div class="bg-white rounded-2xl shadow p-5">
          <h3 class="font-semibold mb-3">Statistiques</h3>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span>Patients aujourd’hui</span>
              <span class="font-bold text-blue-600">124</span>
            </div>

            <div class="flex justify-between">
              <span>En attente</span>
              <span class="font-bold text-orange-500">18</span>
            </div>

            <div class="flex justify-between">
              <span>Consultés</span>
              <span class="font-bold text-green-600">96</span>
            </div>
          </div>
        </div>

        <!-- ACTION RAPIDE -->
        <div class="bg-white rounded-2xl shadow p-5">
          <h3 class="font-semibold mb-3">Actions rapides</h3>

          <div class="flex flex-col gap-2">
            <button @click="goFiche"  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Nouveau patient
            </button>

            <button class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              Scanner badge
            </button>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router"

import StepReception from "../components/StepReception.vue"
import AgentSearchPage from "../components/agents/pages/AgentSearchPage.vue"
import PatientListPage from "../components/patients/pages/PatientListPage.vue"

const router = useRouter()
const typePatient = ref(null)

function setTypePatient(patient){
  typePatient.value = patient
}

function handleBack(){
  typePatient.value = null
}

const currentComponent = computed(() => {
  if (typePatient.value === "AGENT") return AgentSearchPage
  if (typePatient.value === "PUBLIC") return PatientListPage
  return null
})

function goFiche() {
  router.push({ name: "PersonCreate" })
}
</script>