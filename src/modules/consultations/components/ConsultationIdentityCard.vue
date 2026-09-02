<script setup>
import { computed } from 'vue'

import ConsultationStatusBadge from '@/modules/consultations/components/ConsultationStatusBadge.vue'
import { patientDisplayName } from '@/shared/utils/patient'

const props = defineProps({
  consultation: {
    type: Object,
    required: true,
  },
})

const displayName = computed(() =>
  patientDisplayName(
    {
      nom: props.consultation.nom,
      postnom: props.consultation.postnom,
      prenom: props.consultation.prenom,
    },
    props.consultation.numero_patient,
  ),
)

function dash(value) {
  return value || '—'
}

function dateLabel(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}
</script>

<template>
  <section class="his-card p-5">
    <div
      class="flex flex-col justify-between gap-4 md:flex-row md:items-start"
    >
      <div>
        <div
          class="flex flex-wrap items-center gap-3"
        >
          <h2
            class="text-xl font-semibold text-slate-950"
          >
            {{ displayName }}
          </h2>

          <ConsultationStatusBadge
            :statut="consultation.statut"
          />
        </div>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Patient
          {{ dash(consultation.numero_patient) }}
          · Épisode
          {{ dash(consultation.numero_fiche) }}
        </p>
      </div>

      <div
        class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
      >
        Commencée le :
        {{ dateLabel(consultation.created_at) }}
      </div>
    </div>

    <dl
      class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <dt
          class="text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Consultation
        </dt>
        <dd
          class="mt-1 text-sm font-semibold text-slate-900"
        >
          {{
            dash(
              consultation.consultation_code,
            )
          }}
        </dd>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <dt
          class="text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Médecin
        </dt>
        <dd
          class="mt-1 text-sm font-semibold text-slate-900"
        >
          {{ dash(consultation.medecin) }}
        </dd>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <dt
          class="text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Épisode
        </dt>
        <dd
          class="mt-1 text-sm font-semibold text-slate-900"
        >
          {{ dash(consultation.episode_status) }}
        </dd>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <dt
          class="text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Décision
        </dt>
        <dd
          class="mt-1 text-sm font-semibold text-slate-900"
        >
          {{ dash(consultation.decision) }}
        </dd>
      </div>
    </dl>
  </section>
</template>
