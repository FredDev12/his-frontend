<script setup>
defineProps({
  title: {
    type: String,
    default: ""
  },
  subtitle: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header v-if="title || subtitle || $slots.actions" class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 v-if="title" class="text-base font-bold text-slate-950">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="p-5">
      <slot />
    </div>
  </section>
</template>
