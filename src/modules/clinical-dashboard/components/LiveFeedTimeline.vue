<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  generatedAt: { type: String, default: "" },
})
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5">
    <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Activité en temps réel</h2>
        <p class="text-sm text-slate-500">
          Derniers événements cliniques et opérationnels du Centre de Commande.
        </p>
      </div>

      <p v-if="generatedAt" class="text-xs text-slate-400">
        Mise à jour : {{ generatedAt }}
      </p>
    </div>

    <p v-if="items.length === 0" class="text-sm text-slate-500">
      Aucun événement temps réel chargé.
    </p>

    <div v-else class="space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="relative border-l-2 pl-4"
        :class="{
          'border-blue-500': item.variant === 'primary',
          'border-emerald-500': item.variant === 'success',
          'border-amber-500': item.variant === 'warning',
          'border-rose-500': item.variant === 'danger',
          'border-red-600': item.variant === 'emergency',
        }"
      >
        <div
          class="absolute -left-[7px] top-1 h-3 w-3 rounded-full"
          :class="{
            'bg-blue-500': item.variant === 'primary',
            'bg-emerald-500': item.variant === 'success',
            'bg-amber-500': item.variant === 'warning',
            'bg-rose-500': item.variant === 'danger',
            'bg-red-600': item.variant === 'emergency',
          }"
        />

        <p class="text-sm font-semibold text-slate-950">
          {{ item.title || "Événement" }}
        </p>

        <p class="mt-1 text-sm text-slate-600">
          {{ item.message || "—" }}
        </p>

        <div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
          <span>{{ item.status || "—" }}</span>
          <span>·</span>
          <span>{{ item.createdAt || "—" }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
