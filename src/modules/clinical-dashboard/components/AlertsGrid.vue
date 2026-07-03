<script setup>
import AlertCard from "@/modules/clinical-dashboard/components/AlertCard.vue"

defineProps({
  alerts: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <AlertCard
      title="Patients critiques"
      :value="alerts.criticalPatients || 0"
      description="Patients marqués urgents"
      variant="emergency"
    />

    <AlertCard
      title="Patients en attente"
      :value="alerts.waitingPatients || 0"
      description="Parcours clinique en attente"
      variant="warning"
    />

    <AlertCard
      title="Hospitalisations actives"
      :value="alerts.activeHospitalisations || 0"
      description="Patients actuellement hospitalisés"
      variant="neutral"
    />

    <AlertCard
      title="Sorties en attente"
      :value="alerts.pendingDischarges || 0"
      description="Sorties à suivre"
      variant="warning"
    />

    <AlertCard
      title="Factures impayées"
      :value="alerts.unpaidInvoices || 0"
      description="À connecter au module facturation"
      variant="danger"
    />

    <AlertCard
      title="Examens urgents"
      :value="alerts.urgentLabResults || 0"
      description="À connecter au laboratoire"
      variant="emergency"
    />

    <AlertCard
      title="Stock pharmacie faible"
      :value="alerts.lowDrugStock || 0"
      description="À connecter au stock"
      variant="danger"
    />
  </section>
</template>
