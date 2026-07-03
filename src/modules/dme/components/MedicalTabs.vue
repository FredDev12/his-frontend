<script setup>
import { computed } from "vue"
import { useAuthStore } from "@/modules/auth/stores/auth.store"

defineProps({
  activeTab: { type: String, default: "resume" },
})

defineEmits(["change"])

const auth = useAuthStore()

const tabs = computed(() =>
  [
    { key: "resume", label: "Résumé", permission: "dme:read" },
    { key: "consultations", label: "Consultations", permission: "dme:clinical_read" },
    { key: "examens", label: "Examens", permission: "dme:clinical_read" },
    { key: "prescriptions", label: "Prescriptions", permission: "dme:clinical_read" },
    { key: "facturation", label: "Facturation", permission: "dme:billing_read" },
    { key: "paiements", label: "Paiements", permission: "dme:billing_read" },
    { key: "hospitalisation", label: "Hospitalisation", permission: "dme:clinical_read" },
    { key: "audit", label: "Audit", permission: "dme:audit_read" },
  ].filter((tab) => auth.hasPermission(tab.permission)),
)
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="rounded-xl px-3 py-2 text-sm font-medium"
      :class="activeTab === tab.key ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
      @click="$emit('change', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
