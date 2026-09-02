<script setup>
import { computed, reactive, ref } from 'vue'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import { agentsService } from '@/modules/agents/services/agents.service'

const props = defineProps({
  patientType: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['selected', 'cleared'])

const filters = reactive({
  cac_id_co: '',
  nom_post: '',
  prenom: '',
  site: '',
  telephone: '',
})

const spouseVerification = reactive({
  documentType: '',
  documentReference: '',
})

const loading = ref(false)
const searched = ref(false)
const agents = ref([])
const selectedAgent = ref(null)
const confirmed = ref(false)

const isSpouseFlow = computed(() => props.patientType === 'AYANT_DROIT')
const hasFilter = computed(() =>
  Object.values(filters).some((value) => String(value || '').trim().length >= 2),
)

const spouseDocumentOptions = [
  { value: 'MARRIAGE_CERTIFICATE', label: 'Acte de mariage' },
  { value: 'CAC_FAMILY_RECORD', label: 'Fiche familiale CAC' },
  {
    value: 'CAC_COVERAGE_ATTESTATION',
    label: 'Attestation de prise en charge CAC',
  },
]

const selectedSpouseName = computed(() =>
  String(selectedAgent.value?.nom_conjoint || '').trim(),
)

const spouseVerificationComplete = computed(
  () =>
    Boolean(selectedSpouseName.value) &&
    Boolean(spouseVerification.documentType) &&
    spouseVerification.documentReference.trim().length >= 3,
)

function fullName(agent) {
  return [agent?.nom_post, agent?.prenom].filter(Boolean).join(' ') || '—'
}

function canSelectAgent(agent) {
  if (!isSpouseFlow.value) return true
  return Boolean(String(agent?.nom_conjoint || '').trim())
}

function resetSelection() {
  if (confirmed.value) {
    emit('cleared')
  }

  selectedAgent.value = null
  confirmed.value = false
  spouseVerification.documentType = ''
  spouseVerification.documentReference = ''
}

async function search() {
  if (!hasFilter.value) return

  loading.value = true
  searched.value = true
  resetSelection()

  try {
    const payload = await agentsService.search({
      ...filters,
      page: 1,
      limit: 20,
    })
    agents.value = Array.isArray(payload?.data) ? payload.data : []
  } finally {
    loading.value = false
  }
}

function selectAgent(agent) {
  if (!canSelectAgent(agent)) return

  if (
    confirmed.value &&
    selectedAgent.value?.cac_id_co !== agent?.cac_id_co
  ) {
    emit('cleared')
  }

  selectedAgent.value = agent
  confirmed.value = false
  spouseVerification.documentType = ''
  spouseVerification.documentReference = ''
}

function confirmSelection() {
  const agent = selectedAgent.value
  if (!agent || confirmed.value) return

  if (isSpouseFlow.value) {
    if (!spouseVerificationComplete.value) return

    emit('selected', {
      source: 'AGENT_MOCK_CONTRACT',
      agent,
      relationship: 'SPOUSE',
      spouseVerification: {
        documentType: spouseVerification.documentType,
        documentReference: spouseVerification.documentReference.trim(),
      },
      declaredSpouseName: selectedSpouseName.value,
      patient: {
        firstName: '',
        lastName: '',
        middleName: '',
        gender: '',
        birthDate: '',
        estimatedAge: '',
        phone: '',
        address: '',
      },
    })

    confirmed.value = true
    return
  }

  const externalGender = String(agent.sexe || '').toUpperCase()

  emit('selected', {
    source: 'AGENT_MOCK_CONTRACT',
    agent,
    relationship: 'SELF',
    spouseVerification: null,
    patient: {
      firstName: agent.prenom || '',
      lastName: agent.nom_post || '',
      middleName: '',
      gender: ['M', 'F'].includes(externalGender) ? externalGender : '',
      birthDate: agent.date_de_naissance || '',
      estimatedAge: '',
      phone: agent.telephone || '',
      address: agent.adresse || agent.site || '',
    },
  })

  confirmed.value = true
}
</script>

<template>
  <section class="space-y-5">
    <div>
      <h2 class="text-lg font-semibold text-slate-950">
        {{ isSpouseFlow ? 'Vérification du conjoint CAC' : 'Vérification agent CAC' }}
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        Recherche dans le répertoire local de test, conforme à la structure Agent CAC :
        CAC ID, nom/postnom, prénom, site ou téléphone.
      </p>
    </div>

    <div
      v-if="isSpouseFlow"
      class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
    >
      La V1 prend en charge uniquement le conjoint ou la conjointe déclaré(e) dans
      <code>nom_conjoint</code>. Les enfants et les parents seront ajoutés dans une
      prochaine mise à jour. Un justificatif de rattachement est obligatoire.
    </div>

    <form class="grid gap-3 md:grid-cols-2 xl:grid-cols-5" @submit.prevent="search">
      <BaseInput v-model="filters.cac_id_co" label="CAC ID" placeholder="CAC-AG-002" />
      <BaseInput v-model="filters.nom_post" label="Nom / postnom" placeholder="KALALA ILUNGA" />
      <BaseInput v-model="filters.prenom" label="Prénom" placeholder="Joseph" />
      <BaseInput v-model="filters.site" label="Site" placeholder="Site Mine" />
      <BaseInput v-model="filters.telephone" label="Téléphone" placeholder="099..." />

      <div class="md:col-span-2 xl:col-span-5">
        <BaseButton type="submit" :disabled="!hasFilter" :loading="loading">
          Rechercher dans le répertoire CAC
        </BaseButton>
      </div>
    </form>

    <div v-if="agents.length" class="grid gap-3">
      <button
        v-for="agent in agents"
        :key="agent.cac_id_co"
        type="button"
        class="rounded-2xl border p-4 text-left transition"
        :class="[
          selectedAgent?.cac_id_co === agent.cac_id_co
            ? 'border-blue-300 bg-blue-50'
            : 'border-slate-200 bg-white hover:bg-slate-50',
          !canSelectAgent(agent) ? 'cursor-not-allowed opacity-60' : '',
        ]"
        :disabled="!canSelectAgent(agent)"
        @click="selectAgent(agent)"
      >
        <p class="font-semibold text-slate-950">{{ fullName(agent) }}</p>
        <p class="mt-1 text-sm text-slate-500">
          CAC ID : {{ agent.cac_id_co || '—' }} · {{ agent.site || '—' }} ·
          {{ agent.fonction || '—' }}
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Téléphone : {{ agent.telephone || '—' }}
        </p>
        <p v-if="isSpouseFlow" class="mt-2 text-sm font-medium">
          {{
            agent.nom_conjoint
              ? `Conjoint(e) déclaré(e) : ${agent.nom_conjoint}`
              : 'Aucun conjoint déclaré — sélection indisponible'
          }}
        </p>
      </button>
    </div>

    <div
      v-else-if="searched && !loading"
      class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
    >
      Aucun agent ne correspond aux critères fournis.
    </div>

    <div
      v-if="selectedAgent"
      class="rounded-2xl border border-blue-200 bg-blue-50 p-4"
    >
      <h3 class="font-semibold text-slate-950">
        {{ isSpouseFlow ? 'Confirmer le rattachement du conjoint' : 'Confirmer l’agent' }}
      </h3>

      <p class="mt-2 text-sm text-slate-700">
        Agent référent : {{ fullName(selectedAgent) }} · {{ selectedAgent.cac_id_co }}
      </p>

      <template v-if="isSpouseFlow">
        <div class="mt-4 rounded-xl border border-blue-200 bg-white p-4">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
            Conjoint(e) déclaré(e)
          </p>
          <p class="mt-1 font-semibold text-slate-950">{{ selectedSpouseName }}</p>
          <p class="mt-2 text-sm text-slate-600">
            L’identité complète sera saisie ensuite d’après le document présenté et devra
            correspondre exactement à ce nom déclaré.
          </p>
        </div>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <BaseSelect
            v-model="spouseVerification.documentType"
            label="Justificatif vérifié"
            :options="spouseDocumentOptions"
            placeholder="Sélectionner le justificatif"
            required
            :disabled="confirmed"
          />

          <BaseInput
            v-model="spouseVerification.documentReference"
            label="Référence du justificatif"
            placeholder="Ex. ACTE-MAR-2026-001"
            required
            :disabled="confirmed"
          />
        </div>
      </template>

      <p v-else class="mt-1 text-sm text-slate-600">
        Date de naissance : {{ selectedAgent.date_de_naissance || '—' }} · Sexe :
        {{ selectedAgent.sexe || '—' }}
      </p>

      <div class="mt-4">
        <BaseButton
          :disabled="
            confirmed ||
            (isSpouseFlow && !spouseVerificationComplete)
          "
          @click="confirmSelection"
        >
          {{
            confirmed
              ? 'Sélection confirmée'
              : isSpouseFlow
                ? 'Confirmer le conjoint'
                : 'Confirmer cet agent'
          }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>
