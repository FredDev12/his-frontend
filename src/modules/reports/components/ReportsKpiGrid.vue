<script setup>
import ReportStatCard from '@/modules/reports/components/ReportStatCard.vue'

defineProps({
  report: {
    type: Object,
    default: null,
  },
})

function formatMoney(value, devise) {
  const amount = Number(value || 0)

  return `${amount.toLocaleString('fr-FR')} ${devise || 'CDF'}`
}
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <ReportStatCard
      title="Patients"
      :value="report?.kpis?.patients || 0"
      subtitle="Patients enregistrés"
      tone="primary"
    />

    <ReportStatCard
      title="Réceptions"
      :value="report?.kpis?.receptions || 0"
      subtitle="Admissions / passages"
      tone="success"
    />

    <ReportStatCard
      title="Consultations"
      :value="report?.kpis?.consultations || 0"
      subtitle="Actes médicaux"
      tone="primary"
    />

    <ReportStatCard
      title="Urgences triage"
      :value="report?.kpis?.urgentTriage || 0"
      subtitle="Cas signalés urgents"
      tone="danger"
    />

    <ReportStatCard
      title="Laboratoire"
      :value="report?.kpis?.laboratoire || 0"
      subtitle="Demandes / résultats"
      tone="neutral"
    />

    <ReportStatCard
      title="Imagerie"
      :value="report?.kpis?.imagerie || 0"
      subtitle="Examens imagerie"
      tone="neutral"
    />

    <ReportStatCard
      title="Pharmacie"
      :value="report?.kpis?.pharmacie || 0"
      subtitle="Prescriptions"
      tone="warning"
    />

    <ReportStatCard
      title="Recettes caisse"
      :value="formatMoney(report?.kpis?.totalPaiements, report?.kpis?.devise)"
      subtitle="Montant total observé"
      tone="success"
    />
  </section>
</template>
