<script setup>
import PharmacieStatusBadge from '@/modules/pharmacie/components/PharmacieStatusBadge.vue'

defineProps({
  prescription: {
    type: Object,
    required: true,
  },
})

function dash(value) {
  return value || '—'
}
</script>

<template>
  <section class="his-card p-5">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ dash(prescription.medicament_principal) }}
          </h2>

          <PharmacieStatusBadge :statut="prescription.statut" />
        </div>

        <p class="mt-2 text-sm text-slate-500">
          Patient N° {{ dash(prescription.numero_patient) }} · Fiche
          {{ dash(prescription.numero_fiche) }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Créée le : {{ dash(prescription.created_at) }}
      </div>
    </div>

    <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Dosage</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">{{ dash(prescription.dosage) }}</dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Fréquence</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(prescription.frequence) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Consultation</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ dash(prescription.consultation_id) }}
        </dd>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Médicaments</dt>
        <dd class="mt-1 text-sm font-semibold text-slate-900">
          {{ prescription.medicaments.length }}
        </dd>
      </div>
    </dl>
  </section>
</template>
