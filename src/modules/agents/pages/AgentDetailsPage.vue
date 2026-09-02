<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'
import AgentIdentityCard from '@/modules/agents/components/AgentIdentityCard.vue'
import AgentMedicalFileActions from '@/modules/agents/components/AgentMedicalFileActions.vue'

import { useAgentsStore } from '@/modules/agents/stores/agents.store'
import { useToastStore } from '@/shared/stores/toast.store'

const route = useRoute()
const router = useRouter()
const store = useAgentsStore()
const toast = useToastStore()

const agentId = computed(() => route.params.id)
const agent = computed(() => store.selectedAgent)

onMounted(async () => {
  try {
    await store.fetchAgentById(agentId.value)
  } catch (error) {
    console.error('[Agents CAC] Agent introuvable:', error)
    toast.error(error.response?.data?.message || 'Agent CAC introuvable.')
    router.push('/agents')
  }
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail agent CAC</h1>

        <p class="his-page-subtitle">Informations issues du contrat de l’API externe des agents CAC.</p>
      </div>

      <RouterLink to="/agents">
        <BaseButton variant="secondary"> Retour </BaseButton>
      </RouterLink>
    </header>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de l’agent...
    </div>

    <div v-else-if="agent" class="space-y-6">
      <AgentIdentityCard :agent="agent" />
      <AgentMedicalFileActions :agent="agent" />

      <section class="grid gap-6 xl:grid-cols-2">
        <BaseCard
          title="Informations personnelles"
          subtitle="État civil et informations familiales."
        >
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Nom conjoint</p>
              <p class="mt-1 font-semibold text-slate-900">{{ agent.nom_conjoint || '—' }}</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                Nombre enfants
              </p>
              <p class="mt-1 font-semibold text-slate-900">{{ agent.nbre_enfa || '—' }}</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Enfants</p>

              <div v-if="agent.enfants?.length" class="mt-3 space-y-2">
                <div
                  v-for="(child, index) in agent.enfants"
                  :key="`${child.nom}-${index}`"
                  class="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200"
                >
                  <span class="font-semibold text-slate-900">
                    {{ child.nom || '—' }}
                  </span>

                  <span
                    class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {{ child.sexe_label || child.sexe || '—' }}
                  </span>
                </div>
              </div>

              <p v-else class="mt-1 font-semibold text-slate-900">—</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Adresse et parents" subtitle="Informations complémentaires.">
          <div class="space-y-4">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Adresse</p>
              <p class="mt-1 font-semibold text-slate-900">{{ agent.adresse || '—' }}</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Parents</p>
              <p class="mt-1 font-semibold text-slate-900">{{ agent.parents || '—' }}</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                Statut parents
              </p>
              <p class="mt-1 font-semibold text-slate-900">{{ agent.statutparents || '—' }}</p>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>
  </div>
</template>
