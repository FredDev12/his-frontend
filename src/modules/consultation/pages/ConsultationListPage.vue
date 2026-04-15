<template>
  <div class="p-6 space-y-4">

    <!-- HEADER -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Consultations</h1>
        <p class="text-sm text-gray-500">Gestion des consultations médicales</p>
      </div>

      <div class="flex gap-2">
        <BaseButton variant="secondary" :loading="isLoading" @click="refresh">
          Actualiser
        </BaseButton>
        <BaseButton variant="primary" @click="createNew">
          Nouvelle Consultation
        </BaseButton>
      </div>
    </div>

    <!-- FILTRES -->
    <div class="card space-y-3">

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

        <!-- Recherche -->
        <div>
          <label class="text-sm text-gray-600">Recherche</label>
          <BaseInput
            v-model="searchQuery"
            placeholder="Nom patient, motif, diagnostic..."
            @input="debouncedSearch"
          />
        </div>

        <!-- Statut -->
        <div>
          <label class="text-sm text-gray-600">Statut</label>
          <select v-model="selectedStatus" @change="searchConsultations" class="px-3 py-2 border rounded w-full">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Type -->
        <div>
          <label class="text-sm text-gray-600">Type</label>
          <select v-model="selectedType" @change="searchConsultations" class="px-3 py-2 border rounded w-full">
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Bouton reset -->
        <div class="flex items-end">
          <BaseButton variant="outline" @click="resetFilters" class="w-full">
            Réinitialiser
          </BaseButton>
        </div>

      </div>

      <!-- Compteur -->
      <div class="flex justify-between items-center">
        <BaseBadge type="primary">
          {{ filteredConsultations.length }} consultation(s)
        </BaseBadge>
      </div>

    </div>

    <!-- TABLE -->
    <div class="card">
      <BaseTable :data="filteredConsultations" :pageSize="10">

        <!-- HEADER -->
        <template #header>
          <thead class="bg-gray-50 text-gray-600 sticky top-0 z-10">
            <tr class="text-left">
              <th class="p-3">ID</th>
              <th class="p-3">Patient</th>
              <th class="p-3">Médecin</th>
              <th class="p-3">Date</th>
              <th class="p-3">Motif</th>
              <th class="p-3">Statut</th>
              <th class="p-3">Actions</th>
            </tr>
          </thead>
        </template>

        <!-- BODY -->
        <template #default="{ item }">
          <tr class="hover:bg-gray-50">
            <td class="p-3 font-medium">#{{ item.id }}</td>
            <td class="p-3">
              <div>
                <div class="font-medium">{{ item.patient?.nom }} {{ item.patient?.prenom }}</div>
                <div class="text-sm text-gray-500">{{ item.patient?.telephone }}</div>
              </div>
            </td>
            <td class="p-3">
              <div v-if="item.medecin">
                Dr. {{ item.medecin.nom }} {{ item.medecin.prenom }}
              </div>
              <div v-else class="text-gray-400">Non assigné</div>
            </td>
            <td class="p-3">
              <div>{{ formatDate(item.dateConsultation) }}</div>
              <div class="text-sm text-gray-500">{{ item.heureConsultation }}</div>
            </td>
            <td class="p-3">
              <div class="max-w-xs truncate">{{ item.motif }}</div>
            </td>
            <td class="p-3">
              <BaseBadge :type="getStatusBadgeType(item.statut)">
                {{ getStatusLabel(item.statut) }}
              </BaseBadge>
            </td>
            <td class="p-3">
              <div class="flex gap-1">
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="viewDetail(item)"
                >
                  Voir
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="sm"
                  @click="editConsultation(item)"
                  v-if="item.statut !== 'TERMINEE'"
                >
                  Modifier
                </BaseButton>
              </div>
            </td>
          </tr>
        </template>

        <!-- EMPTY STATE -->
        <template #empty>
          <div class="text-center py-8">
            <div class="text-gray-400 mb-2">Aucune consultation trouvée</div>
            <BaseButton variant="primary" @click="createNew">
              Créer la première consultation
            </BaseButton>
          </div>
        </template>

      </BaseTable>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConsultations } from '../composables/useConsultations'
import BaseButton from '../../../components/ui/BaseButton.vue'
import BaseInput from '../../../components/ui/BaseInput.vue'
import BaseTable from '../../../components/ui/BaseTable.vue'
import BaseBadge from '../../../components/ui/BaseBadge.vue'

// Composables
const {
  searchQuery,
  selectedStatus,
  selectedType,
  filteredConsultations,
  statusOptions,
  typeOptions,
  isLoading,
  searchConsultations,
  resetFilters,
  getStatusBadgeType,
  getStatusLabel
} = useConsultations()

// Router
const router = useRouter()

// Methods
const refresh = async () => {
  await searchConsultations()
}

const createNew = () => {
  router.push({ name: 'ConsultationCreate' })
}

const viewDetail = (consultation) => {
  router.push({
    name: 'ConsultationDetail',
    params: { id: consultation.id }
  })
}

const editConsultation = (consultation) => {
  router.push({
    name: 'ConsultationEdit',
    params: { id: consultation.id }
  })
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchConsultations()
  }, 300)
}

// Lifecycle
onMounted(() => {
  //searchConsultations()
})
</script>


