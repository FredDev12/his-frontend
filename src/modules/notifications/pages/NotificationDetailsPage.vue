<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/base/BaseButton.vue'
import BaseCard from '@/shared/ui/base/BaseCard.vue'

import NotificationTypeBadge from '@/modules/notifications/components/NotificationTypeBadge.vue'
import NotificationPriorityBadge from '@/modules/notifications/components/NotificationPriorityBadge.vue'

import { useNotificationsStore } from '@/modules/notifications/stores/notifications.store'
import { useToastStore } from '@/shared/stores/toast.store'
import { formatDateTime } from '@/shared/utils/date'

const route = useRoute()
const router = useRouter()
const store = useNotificationsStore()
const toast = useToastStore()

const notificationId = computed(() => route.params.id)
const notification = computed(() => store.selectedNotification)

const patientContext = computed(() => {
  const payload = notification.value?.payload || {}

  const patient =
    payload.patient ||
    payload.patient_name ||
    payload.nom_patient ||
    payload.identification_patient ||
    payload.identificationPatient ||
    null

  if (!patient) return null

  if (typeof patient === 'string') {
    return {
      label: patient,
      numero: payload.numero_patient || payload.patient_id || payload.patientId || '',
      fiche: payload.numero_fiche || payload.fiche || '',
      raw: patient,
    }
  }

  if (typeof patient === 'object') {
    const label = [patient.nom, patient.postnom, patient.prenom || patient.prénom]
      .filter(Boolean)
      .join(' ')

    return {
      label: label || patient.name || patient.fullname || 'Patient non identifié',
      numero: patient.numero_patient || patient.numeroPatient || patient.id || '',
      fiche: patient.numero_fiche || patient.numeroFiche || '',
      raw: patient,
    }
  }

  return null
})

const hasPatientContext = computed(() => Boolean(patientContext.value?.label))

onMounted(async () => {
  try {
    await store.fetchNotificationById(notificationId.value)

    if (notification.value && !notification.value.read) {
      await store.markAsRead(notification.value.id)
    }
  } catch (error) {
    console.error('[Notifications] Introuvable:', error)
    toast.error(error.message || 'Notification introuvable.')
    router.push('/notifications')
  }
})

function stringify(value) {
  if (!value) return '—'

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 class="his-page-title">Détail notification</h1>

        <p class="his-page-subtitle">Contexte complet de l’événement reçu par le HIS.</p>
      </div>

      <RouterLink to="/notifications">
        <BaseButton variant="secondary"> Retour </BaseButton>
      </RouterLink>
    </header>

    <div v-if="store.loadingDetails" class="his-card p-8 text-center text-sm text-slate-500">
      Chargement de la notification...
    </div>

    <div v-else-if="notification" class="space-y-6">
      <section class="his-card p-5">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-xl font-semibold text-slate-950">
                {{ notification.title }}
              </h2>

              <NotificationTypeBadge :type="notification.type" />
              <NotificationPriorityBadge :priority="notification.priority" />
            </div>

            <p class="mt-2 text-sm text-slate-500">
              Module {{ notification.module || '—' }} · Entité {{ notification.entity || '—' }}
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {{ formatDateTime(notification.created_at) }}
          </div>
        </div>

        <p class="mt-6 text-sm leading-6 text-slate-700">
          {{ notification.message || '—' }}
        </p>
      </section>

      <BaseCard
        title="Contexte"
        subtitle="Référence métier, patient concerné et payload technique."
      >
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-if="hasPatientContext"
            class="rounded-2xl border border-blue-200 bg-blue-50 p-4 md:col-span-2"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-blue-600">
              Patient concerné
            </p>

            <p class="mt-2 text-lg font-semibold text-slate-950">
              {{ patientContext.label }}
            </p>

            <div class="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
              <span
                v-if="patientContext.numero"
                class="rounded-full bg-white px-3 py-1 ring-1 ring-blue-100"
              >
                Patient N° {{ patientContext.numero }}
              </span>

              <span
                v-if="patientContext.fiche"
                class="rounded-full bg-white px-3 py-1 ring-1 ring-blue-100"
              >
                Fiche {{ patientContext.fiche }}
              </span>

              <span class="rounded-full bg-white px-3 py-1 ring-1 ring-blue-100">
                Priorité : {{ notification.priority || '—' }}
              </span>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Entité ID</p>

            <p class="mt-1 font-semibold text-slate-900">
              {{ notification.entity_id || '—' }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Lecture</p>

            <p class="mt-1 font-semibold text-slate-900">
              {{ notification.read ? 'Lue' : 'Non lue' }}
            </p>
          </div>
        </div>

        <div class="mt-5">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
            Payload technique
          </p>

          <pre
            class="mt-3 max-h-[480px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700"
            >{{ stringify(notification.payload) }}</pre
          >
        </div>
      </BaseCard>
    </div>
  </div>
</template>
