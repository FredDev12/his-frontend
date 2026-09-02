<script setup>
import {
  reactive,
  ref,
  watch,
} from 'vue'

import {
  createEmptyExamenRequestItem,
  createExamenBatchDraft,
  EXAMEN_TYPES,
  MAX_EXAMEN_BATCH_ITEMS,
} from '@/modules/consultations/policies/consultation-examen-request-ui.policy'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseInput from '@/shared/ui/base/BaseInput.vue'
import BaseSelect from '@/shared/ui/base/BaseSelect.vue'
import BaseTextarea from '@/shared/ui/base/BaseTextarea.vue'
import Drawer from '@/shared/ui/overlay/Drawer.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  consultation: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'close',
  'review',
])

const form = reactive({
  items: [
    createEmptyExamenRequestItem(),
  ],
})

const localError = ref('')

function reset() {
  form.items = [
    createEmptyExamenRequestItem(),
  ]
  localError.value = ''
}

watch(
  () => props.open,
  (open) => {
    if (open) reset()
  },
)

function addItem() {
  if (
    props.loading ||
    form.items.length >=
      MAX_EXAMEN_BATCH_ITEMS
  ) {
    return
  }

  form.items.push(
    createEmptyExamenRequestItem(),
  )
}

function removeItem(index) {
  if (
    props.loading ||
    form.items.length <= 1
  ) {
    return
  }

  form.items.splice(index, 1)
}

function submit() {
  localError.value = ''

  try {
    emit(
      'review',
      createExamenBatchDraft(form),
    )
  } catch (error) {
    localError.value =
      error?.message ||
      'Demande d’examens invalide.'
  }
}
</script>

<template>
  <Drawer
    :open="open"
    title="Demander des examens"
    :subtitle="
      consultation
        ? `${consultation.consultation_code} · ${consultation.nom || ''} ${consultation.postnom || ''} ${consultation.prenom || ''}`.trim()
        : ''
    "
    width-class="max-w-4xl"
    @close="emit('close')"
  >
    <form
      class="space-y-6"
      @submit.prevent="submit"
    >
      <div
        class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
      >
        Vous pouvez demander un seul examen ou
        constituer un lot. Chaque examen restera
        indépendant pour son traitement et son
        résultat.
      </div>

      <section class="space-y-4">
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3
              class="text-base font-bold text-slate-950"
            >
              Examens demandés
            </h3>
            <p
              class="mt-1 text-sm text-slate-600"
            >
              {{ form.items.length }}
              examen(s) sur
              {{ MAX_EXAMEN_BATCH_ITEMS }}
              maximum.
            </p>
          </div>

          <BaseButton
            variant="secondary"
            :disabled="
              loading ||
              form.items.length >=
                MAX_EXAMEN_BATCH_ITEMS
            "
            @click="addItem"
          >
            Ajouter un examen
          </BaseButton>
        </div>

        <article
          v-for="(item, index) in form.items"
          :key="index"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div
            class="mb-4 flex items-center justify-between gap-3"
          >
            <h4
              class="text-sm font-bold text-slate-900"
            >
              Examen {{ index + 1 }}
            </h4>

            <BaseButton
              variant="danger"
              :disabled="
                loading ||
                form.items.length <= 1
              "
              @click="removeItem(index)"
            >
              Retirer
            </BaseButton>
          </div>

          <div
            class="grid gap-4 md:grid-cols-2"
          >
            <BaseSelect
              v-model="item.type"
              label="Type d’examen"
              :options="EXAMEN_TYPES"
              placeholder="Sélectionner le type"
              required
              :disabled="loading"
            />

            <BaseInput
              v-model="item.name"
              label="Nom de l’examen"
              placeholder="Ex. Numération formule sanguine"
              required
              :disabled="loading"
            />
          </div>

          <div class="mt-4">
            <BaseTextarea
              v-model="item.clinicalIndication"
              label="Indication clinique"
              placeholder="Précisez la raison clinique de cet examen..."
              :rows="3"
              :disabled="loading"
            />
          </div>
        </article>
      </section>

      <div
        v-if="localError"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        role="alert"
      >
        {{ localError }}
      </div>

      <div
        class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end"
      >
        <BaseButton
          variant="secondary"
          :disabled="loading"
          @click="emit('close')"
        >
          Annuler
        </BaseButton>

        <BaseButton
          type="submit"
          :disabled="loading"
        >
          Vérifier les examens
        </BaseButton>
      </div>
    </form>
  </Drawer>
</template>
