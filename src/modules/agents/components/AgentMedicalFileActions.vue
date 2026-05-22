<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

import { agentMedicalFileService } from '@/modules/agents/services/agent-medical-file.service'
import { useToastStore } from '@/shared/stores/toast.store'

const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const toast = useToastStore()

const loading = ref(false)
const items = ref([])

const beneficiaries = computed(() => agentMedicalFileService.buildBeneficiaries(props.agent))

onMounted(() => {
  loadMedicalFiles()
})

watch(
  () => props.agent?.cac_id_co,
  () => {
    loadMedicalFiles()
  },
)

async function loadMedicalFiles() {
  if (!props.agent?.cac_id_co) return

  loading.value = true

  try {
    const results = await Promise.all(
      beneficiaries.value.map(async (beneficiary) => {
        const patient = await agentMedicalFileService.findPatientFile(beneficiary)

        return {
          beneficiary,
          patient,
          exists: Boolean(patient?.id),
        }
      }),
    )

    items.value = results
  } finally {
    loading.value = false
  }
}

function openFile(item) {
  if (!item.patient?.id) return
  router.push(`/patients/${item.patient.id}`)
}

function createFile(item) {
  agentMedicalFileService.savePrefill(item.beneficiary)

  toast.success('Bénéficiaire agent CAC préparé. Complète les champs manquants.')

  router.push('/patients/create?source=agent-cac')
}

function createPublicPatient() {
  router.push('/patients/create?source=public')
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <h2 class="font-semibold text-slate-950">Fiches médicales liées</h2>

        <p class="mt-1 text-sm text-slate-500">
          Ouvrir ou créer une fiche patient pour l’agent CAC, son conjoint ou ses enfants.
        </p>
      </div>

      <BaseButton variant="secondary" :loading="loading" @click="loadMedicalFiles">
        Vérifier fiches
      </BaseButton>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.beneficiary.key"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-950">
              {{ item.beneficiary.beneficiary_name || 'Bénéficiaire' }}
            </p>

            <p class="mt-1 text-sm text-slate-500">
              {{ item.beneficiary.relation_label }}
            </p>

            <p class="mt-1 text-xs text-slate-400">CAC ID {{ item.beneficiary.agent_cac_id }}</p>
          </div>

          <BaseBadge :variant="item.exists ? 'success' : 'warning'">
            {{ item.exists ? 'Fiche existante' : 'Fiche absente' }}
          </BaseBadge>
        </div>

        <div
          class="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
        >
          Agent confirmé : frais fiche = 0
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <BaseButton v-if="item.exists" variant="primary" size="sm" @click="openFile(item)">
            Ouvrir fiche
          </BaseButton>

          <BaseButton v-else variant="success" size="sm" @click="createFile(item)">
            Créer fiche
          </BaseButton>
        </div>
      </article>
    </div>

    <div
      v-if="!loading && items.length === 0"
      class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500"
    >
      Aucun bénéficiaire détecté pour cet agent.
    </div>

    <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p class="text-sm font-semibold text-amber-900">Agent non trouvé ?</p>

      <p class="mt-1 text-sm text-amber-800">
        Si la personne n’est pas confirmée comme agent CAC ou bénéficiaire, elle doit être traitée
        comme patient public. Les frais normaux s’appliquent.
      </p>

      <div class="mt-3">
        <BaseButton variant="secondary" size="sm" @click="createPublicPatient">
          Créer patient public
        </BaseButton>
      </div>
    </div>
  </section>
</template>
