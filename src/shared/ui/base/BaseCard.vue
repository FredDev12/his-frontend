<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  padded: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <section class="his-card">
    <header v-if="title || subtitle || $slots.actions" class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 v-if="title" class="his-section-title">
          {{ title }}
        </h2>

        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </header>

    <div :class="padded ? 'p-5' : ''">
      <slot />
    </div>
  </section>
</template>