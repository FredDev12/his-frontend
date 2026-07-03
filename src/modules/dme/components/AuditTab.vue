<script setup>
defineProps({
  audit: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="space-y-3">
    <div v-if="audit.length === 0" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
      Aucun audit chargé.
    </div>

    <div v-for="item in audit" :key="item.id || item.requestId || item.createdAt" class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col justify-between gap-2 sm:flex-row">
        <div>
          <p class="font-semibold text-slate-950">{{ item.action || "Action auditée" }}</p>
          <p class="mt-1 text-sm text-slate-500">
            Utilisateur : {{ item.userId || item.user || "—" }}
            · Rôle : {{ item.role || "—" }}
            · IP : {{ item.ip || "—" }}
          </p>
        </div>

        <p class="text-xs text-slate-400">
          {{ item.requestId || "requestId —" }}
        </p>
      </div>
    </div>
  </div>
</template>
