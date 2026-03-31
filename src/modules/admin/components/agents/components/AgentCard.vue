<!-- components/agents/components/AgentCard.vue -->
<script setup>
import BaseBadge from "../../../../../components/ui/BaseBadge.vue"

const props = defineProps({
  agent: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  localFilter: {
    type: String,
    default: ""
  },
  filterActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const getInitial = (nom) => {
  return (nom || 'A').charAt(0)
}

const formatName = (nom, prenom) => {
  if (prenom && prenom !== 'null') {
    return `${nom} ${prenom}`
  }
  return nom
}
</script>

<template>
  <button
    type="button"
    @click="emit('select', agent)"
    class="w-full text-left transition-all"
    :class="[
      isSelected 
        ? 'ring-2 ring-blue-500 ring-offset-2' 
        : 'hover:ring-1 hover:ring-gray-200'
    ]"
  >
    <div class="bg-white border rounded-xl p-5 hover:shadow-md transition">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {{ getInitial(agent.nom_post) }}
          </div>
          
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-gray-800">
                {{ formatName(agent.nom_post, agent.prenom) }}
              </span>
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {{ agent.cac_id_co }}
              </span>
            </div>
            
            <div class="flex items-center gap-3 mt-1 text-sm text-gray-600">
              <span>{{ agent.fonction || "Fonction non renseignée" }}</span>
              <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{{ agent.site || "Site non renseigné" }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <BaseBadge :type="agent.sexe === 'M' ? 'primary' : 'warning'" size="sm">
            {{ agent.sexe === 'M' ? 'Homme' : 'Femme' }}
          </BaseBadge>
          <BaseBadge 
            v-if="agent.statut_marital && agent.statut_marital !== '-'" 
            type="success" 
            size="sm"
          >
            {{ agent.statut_marital }}
          </BaseBadge>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div>
          <span class="text-xs text-gray-500 block">Conjoint</span>
          <span class="text-sm font-medium text-gray-700">
            {{ agent.nom_conjoint && agent.nom_conjoint !== '-' ? agent.nom_conjoint : 'Non renseigné' }}
          </span>
        </div>
        
        <div>
          <span class="text-xs text-gray-500 block">Enfants</span>
          <span class="text-sm font-medium text-gray-700">
            {{ agent.nbre_enfa || '0' }}
          </span>
        </div>
        
        <div>
          <span class="text-xs text-gray-500 block">Parents</span>
          <span class="text-sm font-medium text-gray-700">
            {{ agent.parents && agent.parents !== '-' ? agent.parents : 'Non renseigné' }}
          </span>
        </div>
      </div>

      <!-- Highlight du terme recherché -->
      <div v-if="localFilter && filterActive" class="mt-2 text-xs text-blue-600">
        Correspond au filtre "{{ localFilter }}"
      </div>

      <div 
        v-if="isSelected"
        class="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg"
      >
        <span class="text-lg">✓</span>
        <span class="font-medium">Agent sélectionné</span>
      </div>
    </div>
  </button>
</template>