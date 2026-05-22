<script setup>
import { computed } from 'vue'
import PatientStatusBadge from '@/modules/patients/components/PatientStatusBadge.vue'
import BaseBadge from '@/shared/ui/base/BaseBadge.vue'

const props = defineProps({
  patient: {
    type: Object,
    required: true,
  },
})

const agentCac = computed(() => props.patient.agent_cac || props.patient.raw?.agent_cac || {})

const isAgentBeneficiary = computed(() => Boolean(agentCac.value?.agent_cac_id))

function valueOrDash(value) {
  return value || '—'
}

function relationLabel(value) {
  const labels = {
    SELF: 'Agent lui-même',
    SPOUSE: 'Conjoint(e)',
    CHILD: 'Enfant',
    PARENT: 'Parent',
  }

  return labels[value] || value || 'Bénéficiaire agent CAC'
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ valueOrDash(patient.nom) }}
            {{ valueOrDash(patient.postnom) }}
            {{ valueOrDash(patient.prenom) }}
          </h2>

          <PatientStatusBadge :status="patient.statut" />
          <BaseBadge v-if="isAgentBeneficiary" variant="success">
            Agent CAC · {{ relationLabel(agentCac.relation_to_agent) }}
          </BaseBadge>
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ valueOrDash(patient.numero_patient) }} · Fiche
          {{ valueOrDash(patient.numero_fiche) }}
        </p>
        <p v-if="isAgentBeneficiary" class="mt-2 text-sm font-medium text-emerald-700">
          CAC ID {{ agentCac.agent_cac_id }} · Frais fiche exonérés
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créé le : {{ valueOrDash(patient.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Sexe</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ valueOrDash(patient.sexe) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Âge</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ valueOrDash(patient.age) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Téléphone</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ valueOrDash(patient.telephone) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Adresse</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ valueOrDash(patient.adresse) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
