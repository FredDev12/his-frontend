<script setup>

import { onMounted, ref, computed } from "vue"
import { useRoute } from "vue-router"
import api from "@/services/api" // adapte selon ton projet

const route = useRoute()

const person = ref(null)
const loading = ref(false)

const personId = route.params.id

onMounted(async () => {

  loading.value = true

  try {
    const res = await api.get(`/persons/${personId}`)
    person.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }

})

const personType = computed(() => {

  if (!person.value) return null

  if (person.value.type === "agent") return "Agent"
  if (person.value.type === "conjoint") return "Conjoint"
  if (person.value.type === "enfant") return "Enfant"

  return "Public"
})

</script>

<template>

    <div class="max-w-4xl mx-auto p-6">

        <button
            @click="$router.back()"
            class="mb-4 px-4 py-2 bg-gray-200 rounded"
        >
            Retour
        </button>

        <div v-if="loading">
            Chargement...
        </div>

        <div v-if="person" class="bg-white shadow rounded p-6">

            <h2 class="text-2xl font-bold mb-2">
            {{ person.prenom }} {{ person.nom }}
            </h2>

            <span class="bg-purple-100 px-3 py-1 rounded">
            {{ personType }}
            </span>

            <div class="mt-4 space-y-2">

                <p><b>Sexe :</b> {{ person.sexe }}</p>
                <p><b>Date naissance :</b> {{ person.date_naissance }}</p>
                <p><b>Téléphone :</b> {{ person.telephone }}</p>
                <p><b>Adresse :</b> {{ person.adresse }}</p>

            </div>

        </div>

    </div>

</template>