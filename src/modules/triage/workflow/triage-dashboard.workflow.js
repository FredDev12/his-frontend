import {
  normalizeTriageQueueItem,
} from '@/modules/triage/workflow/triage-create.workflow'

function asObject(value) {
  return value && typeof value === 'object' ? value : {}
}

export function createEmptyTriageDashboard() {
  return {
    generatedAt: '',
    period: {
      startAt: '',
      endAt: '',
      timezoneOffsetMinutes: 0,
    },
    queue: {
      total: 0,
      watchCount: 0,
      prolongedCount: 0,
      oldestWaitingMinutes: 0,
      watchThresholdMinutes: 30,
      prolongedThresholdMinutes: 60,
      items: [],
    },
    today: {
      totalTriages: 0,
      priorities: {
        routine: 0,
        urgent: 0,
        veryUrgent: 0,
        vital: 0,
        priorityTotal: 0,
      },
      orientations: {
        immediateConsultations: 0,
        appointments: 0,
      },
    },
    priorityTriages: [],
    recentTriages: [],
    reassessment: {
      awaitingConsultationTotal: 0,
      items: [],
    },
  }
}

export function normalizeTriageDashboard(payload) {
  const data = asObject(payload?.data || payload)
  const queue = asObject(data.queue)
  const today = asObject(data.today)
  const priorities = asObject(today.priorities)
  const orientations = asObject(today.orientations)

  return {
    generatedAt: data.generatedAt || '',
    period: {
      startAt: data.period?.startAt || '',
      endAt: data.period?.endAt || '',
      timezoneOffsetMinutes: Number(
        data.period?.timezoneOffsetMinutes || 0,
      ),
    },
    queue: {
      total: Number(queue.total || 0),
      watchCount: Number(queue.watchCount || 0),
      prolongedCount: Number(queue.prolongedCount || 0),
      oldestWaitingMinutes: Number(
        queue.oldestWaitingMinutes || 0,
      ),
      watchThresholdMinutes: Number(
        queue.watchThresholdMinutes || 30,
      ),
      prolongedThresholdMinutes: Number(
        queue.prolongedThresholdMinutes || 60,
      ),
      items: Array.isArray(queue.items)
        ? queue.items.map(normalizeTriageQueueItem)
        : [],
    },
    today: {
      totalTriages: Number(today.totalTriages || 0),
      priorities: {
        routine: Number(priorities.routine || 0),
        urgent: Number(priorities.urgent || 0),
        veryUrgent: Number(priorities.veryUrgent || 0),
        vital: Number(priorities.vital || 0),
        priorityTotal: Number(
          priorities.priorityTotal || 0,
        ),
      },
      orientations: {
        immediateConsultations: Number(
          orientations.immediateConsultations || 0,
        ),
        appointments: Number(
          orientations.appointments || 0,
        ),
      },
    },
    priorityTriages: Array.isArray(data.priorityTriages)
      ? data.priorityTriages
      : [],
    recentTriages: Array.isArray(data.recentTriages)
      ? data.recentTriages
      : [],
    reassessment: {
      awaitingConsultationTotal: Number(
        data.reassessment?.awaitingConsultationTotal || 0,
      ),
      items: Array.isArray(data.reassessment?.items)
        ? data.reassessment.items
        : [],
    },
  }
}

export function formatTriageWaitingDuration(minutes) {
  const safeMinutes = Math.max(
    0,
    Math.trunc(Number(minutes || 0)),
  )

  const days = Math.floor(safeMinutes / 1_440)
  const minutesAfterDays = safeMinutes % 1_440
  const hours = Math.floor(minutesAfterDays / 60)
  const remainingMinutes = minutesAfterDays % 60

  const parts = []

  if (days > 0) {
    parts.push(`${days} j`)
  }

  if (hours > 0) {
    parts.push(`${hours} h`)
  }

  if (remainingMinutes > 0 || parts.length === 0) {
    parts.push(`${remainingMinutes} min`)
  }

  return parts.join(' ')
}

export function triageWaitingPresentation(level) {
  const normalized = String(level || '').toUpperCase()

  if (normalized === 'PROLONGED') {
    return {
      label: 'Attente prolongée',
      variant: 'danger',
    }
  }

  if (normalized === 'WATCH') {
    return {
      label: 'À surveiller',
      variant: 'warning',
    }
  }

  return {
    label: 'Attente standard',
    variant: 'neutral',
  }
}

export function formatDashboardDateTime(value) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
