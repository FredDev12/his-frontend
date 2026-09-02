<script setup>
import {
  computed,
  onBeforeUnmount,
  watch,
} from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  widthClass: {
    type: String,
    default: 'max-w-3xl',
  },
})

const emit = defineEmits(['close'])

const labelledBy = computed(
  () => 'drawer-title',
)

function close() {
  emit('close')
}

function onKeydown(event) {
  if (
    props.open &&
    event.key === 'Escape'
  ) {
    close()
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document === 'undefined') return

    document.body.style.overflow =
      isOpen ? 'hidden' : ''
  },
  {
    immediate: true,
  },
)

if (typeof window !== 'undefined') {
  window.addEventListener(
    'keydown',
    onKeydown,
  )
}

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener(
      'keydown',
      onKeydown,
    )
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="labelledBy"
    >
      <button
        type="button"
        class="absolute inset-0 bg-slate-950/50"
        aria-label="Fermer le panneau"
        @click="close"
      />

      <aside
        class="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl"
        :class="widthClass"
      >
        <header
          class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6"
        >
          <div>
            <h2
              id="drawer-title"
              class="text-lg font-bold text-slate-950"
            >
              {{ title }}
            </h2>

            <p
              v-if="subtitle"
              class="mt-1 text-sm text-slate-500"
            >
              {{ subtitle }}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Fermer"
            @click="close"
          >
            ×
          </button>
        </header>

        <div
          class="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6"
        >
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="border-t border-slate-200 px-5 py-4 sm:px-6"
        >
          <slot name="footer" />
        </footer>
      </aside>
    </div>
  </Teleport>
</template>
