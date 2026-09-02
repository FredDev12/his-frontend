<script setup>
import { computed } from 'vue'

import {
  clinicalHistoryActorLabel,
  clinicalHistoryPageLabel,
  clinicalHistoryRoleLabel,
  formatClinicalHistoryValue,
} from '@/modules/consultations/policies/consultation-clinical-history-ui.policy'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import DataPagination from '@/shared/ui/data/DataPagination.vue'
import Drawer from '@/shared/ui/overlay/Drawer.vue'
import { formatDateTime } from '@/shared/utils/date'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  consultation: {
    type: Object,
    default: null,
  },
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  page: {
    type: Number,
    default: 1,
  },
  limit: {
    type: Number,
    default: 20,
  },
  count: {
    type: Number,
    default: 0,
  },
  hasPrev: {
    type: Boolean,
    default: false,
  },
  hasNext: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'close',
  'page-change',
])

const subtitle = computed(() => {
  const code =
    props.consultation?.consultation_code ||
    'Consultation'

  const patient = [
    props.consultation?.nom,
    props.consultation?.postnom,
    props.consultation?.prenom,
  ]
    .filter(Boolean)
    .join(' ')

  return patient
    ? `${code} · ${patient}`
    : code
})

const pageLabel = computed(() =>
  clinicalHistoryPageLabel(
    props.page,
    props.limit,
    props.count,
  ),
)
</script>

<template>
  <Drawer
    :open="open"
    title="Historique clinique"
    :subtitle="subtitle"
    width-class="max-w-4xl"
    @close="emit('close')"
  >
    <div
      class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
    >
      Journal clinique en lecture seule. Chaque
      entrée correspond à une sauvegarde médicale
      auditée. Cet historique ne peut pas être
      modifié depuis cette interface.
    </div>

    <div
      v-if="loading && items.length === 0"
      class="py-12 text-center text-sm text-slate-500"
    >
      Chargement de l’historique clinique...
    </div>

    <div
      v-else-if="error && items.length === 0"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      role="alert"
    >
      { error }
    </div>

    <div
      v-else-if="items.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center"
    >
      <p class="font-semibold text-slate-800">
        Aucun historique clinique
      </p>
      <p class="mt-1 text-sm text-slate-500">
        Aucune modification clinique auditée n’a
        encore été enregistrée.
      </p>
    </div>

    <ol
      v-else
      class="space-y-4"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div
          class="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p
              class="font-semibold text-slate-950"
            >
              {{
                clinicalHistoryActorLabel(item)
              }}
            </p>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              {{
                formatDateTime(
                  item.occurredAt,
                )
              }}
            </p>
          </div>

          <BaseBadge variant="primary">
            {{
              clinicalHistoryRoleLabel(
                item.roleCode,
              )
            }}
          </BaseBadge>
        </div>

        <div class="mt-4 space-y-4">
          <div
            v-for="change in item.changes"
            :key="`${item.id}-${change.field}`"
            class="rounded-xl bg-slate-50 p-4"
          >
            <p
              class="text-sm font-semibold text-slate-900"
            >
              {{ change.label }}
            </p>

            <div
              class="mt-3 grid gap-3 lg:grid-cols-2"
            >
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Ancienne valeur
                </p>
                <p
                  class="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700"
                >
                  {{
                    formatClinicalHistoryValue(
                      change.oldValue,
                    )
                  }}
                </p>
              </div>

              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Nouvelle valeur
                </p>
                <p
                  class="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-900"
                >
                  {{
                    formatClinicalHistoryValue(
                      change.newValue,
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ol>

    <template #footer>
      <DataPagination
        :page="page"
        :has-prev="hasPrev"
        :has-next="hasNext"
        :label="pageLabel"
        :disabled="loading"
        @page-change="
          emit(
            'page-change',
            $event,
          )
        "
      />
    </template>
  </Drawer>
</template>
