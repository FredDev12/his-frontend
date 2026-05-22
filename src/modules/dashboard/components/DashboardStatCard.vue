<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: '—',
  },
  subtitle: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'primary',
  },
})

const toneClasses = {
  primary: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  neutral: 'bg-slate-100 text-slate-700',
}
</script>

<template>
  <article class="his-card p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-slate-500">
          {{ title }}
        </p>

        <p class="mt-3 text-3xl font-bold text-slate-950">
          {{ value }}
        </p>

        <p v-if="subtitle" class="mt-2 text-sm text-slate-500">
          {{ subtitle }}
        </p>
      </div>

      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="toneClasses[tone] || toneClasses.primary"
      >
        Aujourd’hui
      </span>
    </div>
  </article>
</template>
