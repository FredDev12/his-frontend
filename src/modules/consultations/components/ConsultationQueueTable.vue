<script setup>
import { RouterLink } from 'vue-router'

import BaseBadge from '@/shared/ui/base/BaseBadge.vue'
import BaseButton from '@/shared/ui/base/BaseButton.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canStart: {
    type: Boolean,
    default: false,
  },
  startingEpisodeId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['start'])

function priorityLabel(priority) {
  return (
    {
      VITALE: 'Urgence vitale',
      TRES_URGENT: 'Très urgent',
      URGENT: 'Urgent',
      ROUTINE: 'Routine',
    }[priority] ||
    priority ||
    'Non définie'
  )
}

function priorityVariant(priority) {
  return (
    {
      VITALE: 'emergency',
      TRES_URGENT: 'danger',
      URGENT: 'warning',
      ROUTINE: 'neutral',
    }[priority] ||
    'neutral'
  )
}

function waitingLabel(minutes) {
  const total = Math.max(
    0,
    Number(minutes) || 0,
  )
  const days = Math.floor(total / 1440)
  const hours = Math.floor(
    (total % 1440) / 60,
  )
  const remainingMinutes = total % 60

  const parts = []

  if (days) parts.push(`${days} j`)
  if (hours) parts.push(`${hours} h`)
  if (
    remainingMinutes ||
    parts.length === 0
  ) {
    parts.push(`${remainingMinutes} min`)
  }

  return parts.join(' ')
}

function bloodPressure(vitals) {
  if (
    vitals?.bloodPressureSystolic ===
      null ||
    vitals?.bloodPressureDiastolic ===
      null
  ) {
    return '—'
  }

  return (
    `${vitals.bloodPressureSystolic}` +
    `/${vitals.bloodPressureDiastolic}`
  )
}

function isStarting(item) {
  return (
    String(props.startingEpisodeId || '') ===
    String(item?.episode?.id || '')
  )
}
</script>

<template>
  <div>
    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
    >
      Chargement de la file médicale...
    </div>

    <div
      v-else-if="items.length === 0"
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center"
    >
      <p class="font-semibold text-slate-900">
        Aucun patient en attente de consultation
      </p>
      <p class="mt-2 text-sm text-slate-500">
        Les épisodes admissibles apparaîtront ici après validation du triage.
      </p>
    </div>

    <template v-else>
      <div
        class="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block"
      >
        <div class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-slate-200 text-sm"
          >
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Patient
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Priorité
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Service
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Constantes
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Attente
                </th>
                <th
                  class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody
              class="divide-y divide-slate-100"
            >
              <tr
                v-for="item in items"
                :key="item.episode.id"
                class="hover:bg-slate-50"
              >
                <td class="px-4 py-4">
                  <p
                    class="font-semibold text-slate-950"
                  >
                    {{ item.patient.displayName }}
                  </p>
                  <p
                    class="mt-1 text-xs text-slate-500"
                  >
                    {{ item.patient.patientCode }}
                    ·
                    {{ item.episode.episodeCode }}
                  </p>
                  <p
                    class="mt-1 text-xs text-slate-500"
                  >
                    Triage
                    {{ item.triage.triageCode }}
                  </p>
                </td>

                <td class="px-4 py-4">
                  <BaseBadge
                    :variant="
                      priorityVariant(
                        item.episode.priority,
                      )
                    "
                  >
                    {{
                      priorityLabel(
                        item.episode.priority,
                      )
                    }}
                  </BaseBadge>
                </td>

                <td class="px-4 py-4">
                  <p
                    class="font-medium text-slate-900"
                  >
                    {{ item.service.name }}
                  </p>
                  <p
                    class="mt-1 text-xs text-slate-500"
                  >
                    {{ item.service.site.name }}
                  </p>
                </td>

                <td
                  class="px-4 py-4 text-slate-600"
                >
                  <p>
                    T°
                    {{
                      item.triage.vitals
                        .temperatureCelsius
                    }}
                    °C · TA
                    {{
                      bloodPressure(
                        item.triage.vitals,
                      )
                    }}
                  </p>
                  <p class="mt-1">
                    FC
                    {{
                      item.triage.vitals
                        .heartRate
                    }}/min · SpO₂
                    {{
                      item.triage.vitals
                        .oxygenSaturation
                    }}
                    %
                  </p>
                </td>

                <td class="px-4 py-4">
                  <p
                    class="font-semibold text-slate-900"
                  >
                    {{
                      waitingLabel(
                        item.waitingMinutes,
                      )
                    }}
                  </p>
                  <p
                    class="mt-1 text-xs text-slate-500"
                  >
                    Depuis la validation du triage
                  </p>
                </td>

                <td class="px-4 py-4">
                  <div
                    class="flex flex-wrap justify-end gap-2"
                  >
                    <BaseButton
                      v-if="canStart"
                      :loading="isStarting(item)"
                      :disabled="
                        Boolean(
                          startingEpisodeId,
                        ) && !isStarting(item)
                      "
                      loading-text="Ouverture..."
                      @click="emit('start', item)"
                    >
                      Commencer la consultation
                    </BaseButton>

                    <RouterLink
                      :to="
                        `/triage/${item.triage.id}`
                      "
                    >
                      <BaseButton
                        variant="secondary"
                        :disabled="
                          Boolean(
                            startingEpisodeId,
                          )
                        "
                      >
                        Consulter le triage
                      </BaseButton>
                    </RouterLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-3 lg:hidden">
        <article
          v-for="item in items"
          :key="item.episode.id"
          class="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div
            class="flex items-start justify-between gap-3"
          >
            <div>
              <h2
                class="font-semibold text-slate-950"
              >
                {{ item.patient.displayName }}
              </h2>
              <p
                class="mt-1 text-xs text-slate-500"
              >
                {{ item.patient.patientCode }}
                ·
                {{ item.episode.episodeCode }}
              </p>
            </div>

            <BaseBadge
              :variant="
                priorityVariant(
                  item.episode.priority,
                )
              "
            >
              {{
                priorityLabel(
                  item.episode.priority,
                )
              }}
            </BaseBadge>
          </div>

          <dl
            class="mt-4 grid grid-cols-2 gap-3 text-sm"
          >
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-400"
              >
                Service
              </dt>
              <dd
                class="mt-1 font-medium text-slate-900"
              >
                {{ item.service.name }}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-400"
              >
                Attente
              </dt>
              <dd
                class="mt-1 font-medium text-slate-900"
              >
                {{
                  waitingLabel(
                    item.waitingMinutes,
                  )
                }}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-400"
              >
                Tension
              </dt>
              <dd
                class="mt-1 font-medium text-slate-900"
              >
                {{
                  bloodPressure(
                    item.triage.vitals,
                  )
                }}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-400"
              >
                SpO₂
              </dt>
              <dd
                class="mt-1 font-medium text-slate-900"
              >
                {{
                  item.triage.vitals
                    .oxygenSaturation
                }}
                %
              </dd>
            </div>
          </dl>

          <div class="mt-4 space-y-2">
            <BaseButton
              v-if="canStart"
              class="w-full"
              :loading="isStarting(item)"
              :disabled="
                Boolean(startingEpisodeId) &&
                !isStarting(item)
              "
              loading-text="Ouverture..."
              @click="emit('start', item)"
            >
              Commencer la consultation
            </BaseButton>

            <RouterLink
              class="block"
              :to="`/triage/${item.triage.id}`"
            >
              <BaseButton
                variant="secondary"
                class="w-full"
                :disabled="
                  Boolean(startingEpisodeId)
                "
              >
                Consulter le triage
              </BaseButton>
            </RouterLink>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>
