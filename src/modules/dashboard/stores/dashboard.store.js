import { defineStore } from 'pinia'
import { dashboardService } from '@/modules/dashboard/services/dashboard.service'

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }

  return fallback
}

function extractItems(payload, keys = []) {
  if (Array.isArray(payload)) return payload

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  const possibleKeys = [
    'data',
    'items',
    'results',
    'patients',
    'receptions',
    'triage',
    'triages',
    'consultations',
    'laboratoire',
    'imagerie',
    'pharmacie',
    'paiements',
    'sorties',
    'audits',
    'logs',
  ]

  for (const key of possibleKeys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  return []
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function getDateValue(item) {
  return pick(item, [
    'created_at',
    'createdAt',
    'date_creation',
    'date',
    'date_heure',
    'date_paiement',
    'datePaiement',
    'date_sortie',
    'dateSortie',
    'timestamp',
  ])
}

function isToday(value) {
  if (!value) return false

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return false

  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function filterToday(items) {
  return items.filter((item) => isToday(getDateValue(item)))
}

function countByStatus(items, acceptedStatuses = []) {
  const accepted = acceptedStatuses.map(normalizeText)

  return items.filter((item) => {
    const status = normalizeText(
      pick(item, ['statut', 'status', 'etat', 'état', 'priority', 'priorite', 'priorité']),
    )

    return accepted.includes(status)
  }).length
}

function countContaining(items, keys, values = []) {
  const accepted = values.map(normalizeText)

  return items.filter((item) => {
    const text = normalizeText(keys.map((key) => item?.[key]).join(' '))
    return accepted.some((value) => text.includes(value))
  }).length
}

function sumPayments(items) {
  return items.reduce((sum, item) => {
    const amount = Number(pick(item, ['montant', 'amount', 'total', 'prix', 'price'], 0))

    return sum + (Number.isNaN(amount) ? 0 : amount)
  }, 0)
}

function getCurrency(items) {
  return pick(items?.[0], ['devise', 'currency'], 'CDF') || 'CDF'
}

function fullPatientName(item) {
  const patient =
    item.patient ||
    item.identification_patient ||
    item.identificationPatient ||
    item.raw?.identification_patient ||
    {}

  const nom = pick(patient, ['nom'], pick(item, ['nom']))
  const postnom = pick(patient, ['postnom'], pick(item, ['postnom']))
  const prenom = pick(patient, ['prenom', 'prénom'], pick(item, ['prenom', 'prénom']))

  return [nom, postnom, prenom].filter(Boolean).join(' ') || 'Patient non identifié'
}

function buildRecentActivity(collections) {
  const activities = []

  collections.receptions.forEach((item) => {
    activities.push({
      id: `reception-${pick(item, ['id'], Math.random())}`,
      module: 'Réception',
      title: 'Nouvelle réception',
      description: fullPatientName(item),
      date: getDateValue(item),
      to: `/receptions/${pick(item, ['id'], '')}`,
    })
  })

  collections.triage.forEach((item) => {
    activities.push({
      id: `triage-${pick(item, ['id'], Math.random())}`,
      module: 'Triage',
      title: 'Évaluation triage',
      description: fullPatientName(item),
      date: getDateValue(item),
      to: `/triage/${pick(item, ['id'], '')}`,
    })
  })

  collections.consultations.forEach((item) => {
    activities.push({
      id: `consultation-${pick(item, ['id'], Math.random())}`,
      module: 'Consultation',
      title: 'Consultation médicale',
      description: fullPatientName(item),
      date: getDateValue(item),
      to: `/consultations/${pick(item, ['id'], '')}`,
    })
  })

  collections.paiements.forEach((item) => {
    activities.push({
      id: `paiement-${pick(item, ['id'], Math.random())}`,
      module: 'Caisse',
      title: 'Paiement enregistré',
      description: `${pick(item, ['montant', 'amount', 'total'], 0)} ${pick(item, ['devise', 'currency'], 'CDF')}`,
      date: getDateValue(item),
      to: `/caisse/${pick(item, ['id'], '')}`,
    })
  })

  collections.sorties.forEach((item) => {
    activities.push({
      id: `sortie-${pick(item, ['id'], Math.random())}`,
      module: 'Sortie',
      title: 'Sortie patient',
      description: fullPatientName(item),
      date: getDateValue(item),
      to: `/sorties/${pick(item, ['id'], '')}`,
    })
  })

  return activities
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)
}

function buildDashboard(payloads, errors = {}) {
  const patients = extractItems(payloads.patients, ['data', 'patients'])
  const receptions = extractItems(payloads.receptions, ['data', 'receptions'])
  const triage = extractItems(payloads.triage, ['data', 'triage', 'triages'])
  const consultations = extractItems(payloads.consultations, ['data', 'consultations'])
  const laboratoire = extractItems(payloads.laboratoire, ['data', 'laboratoire'])
  const imagerie = extractItems(payloads.imagerie, ['data', 'imagerie'])
  const pharmacie = extractItems(payloads.pharmacie, ['data', 'pharmacie', 'prescriptions'])
  const paiements = extractItems(payloads.paiements, ['data', 'paiements', 'payments'])
  const sorties = extractItems(payloads.sorties, ['data', 'sorties'])
  const audit = extractItems(payloads.audit, ['data', 'audits', 'logs'])
  const notifications = Array.isArray(payloads.notifications) ? payloads.notifications : []

  const todayReceptions = filterToday(receptions)
  const todayConsultations = filterToday(consultations)
  const todayPaiements = filterToday(paiements)
  const todaySorties = filterToday(sorties)
  const todayTriage = filterToday(triage)

  const urgentTriage = countContaining(
    triage,
    ['type_passage', 'typePassage', 'priorite', 'priorité', 'statut', 'status'],
    ['urgence', 'urgent', 'rouge'],
  )

  const pendingPayments = countByStatus(paiements, ['pending', 'attente', 'en_attente'])
  const validatedPayments = countByStatus(paiements, ['paid', 'paye', 'payé', 'valide', 'validé'])
  const pendingPharmacy = countByStatus(pharmacie, ['pending', 'attente', 'en_attente'])
  const pendingSorties = countByStatus(sorties, ['pending', 'attente', 'en_attente'])

  const unreadNotifications = notifications.filter((item) => !item.read)
  const urgentNotifications = notifications.filter((item) => {
    const priority = normalizeText(item.priority)
    const type = normalizeText(item.type)

    return priority === 'urgent' || type === 'emergency'
  })

  const collections = {
    receptions,
    triage,
    consultations,
    paiements,
    sorties,
  }

  return {
    generated_at: new Date().toISOString(),

    kpis: {
      patients: patients.length,
      receptionsToday: todayReceptions.length,
      triageToday: todayTriage.length,
      consultationsToday: todayConsultations.length,
      paiementsToday: todayPaiements.length,
      sortiesToday: todaySorties.length,
      urgentTriage,
      unreadNotifications: unreadNotifications.length,
      totalPaiementsToday: sumPayments(todayPaiements),
      totalPaiements: sumPayments(paiements),
      devise: getCurrency(paiements),
    },

    alerts: [
      {
        key: 'urgent-triage',
        label: 'Urgences triage',
        value: urgentTriage,
        tone: urgentTriage > 0 ? 'danger' : 'success',
        description:
          urgentTriage > 0
            ? 'Des patients sont marqués urgents.'
            : 'Aucune urgence triage critique détectée.',
        to: '/triage',
      },
      {
        key: 'pending-payments',
        label: 'Paiements en attente',
        value: pendingPayments,
        tone: pendingPayments > 0 ? 'warning' : 'success',
        description: 'Paiements non encore validés.',
        to: '/caisse',
      },
      {
        key: 'pending-pharmacy',
        label: 'Prescriptions en attente',
        value: pendingPharmacy,
        tone: pendingPharmacy > 0 ? 'warning' : 'success',
        description: 'Prescriptions à délivrer ou à suivre.',
        to: '/pharmacie',
      },
      {
        key: 'pending-sorties',
        label: 'Sorties en attente',
        value: pendingSorties,
        tone: pendingSorties > 0 ? 'warning' : 'success',
        description: 'Sorties patient à clôturer.',
        to: '/sorties',
      },
      {
        key: 'notifications',
        label: 'Notifications non lues',
        value: unreadNotifications.length,
        tone: unreadNotifications.length > 0 ? 'primary' : 'success',
        description: 'Notifications système à consulter.',
        to: '/notifications',
      },
      {
        key: 'urgent-notifications',
        label: 'Notifications urgentes',
        value: urgentNotifications.length,
        tone: urgentNotifications.length > 0 ? 'danger' : 'success',
        description: 'Alertes temps réel prioritaires.',
        to: '/notifications',
      },
    ],

    finance: {
      today: sumPayments(todayPaiements),
      total: sumPayments(paiements),
      devise: getCurrency(paiements),
      validatedPayments,
      pendingPayments,
    },

    recentActivity: buildRecentActivity(collections),

    latestNotifications: notifications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5),

    technical: {
      auditCount: audit.length,
      errors,
      hasPartialErrors: Object.keys(errors || {}).length > 0,
    },
  }
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboard: null,
    raw: {},
    errors: {},

    loading: false,
    error: '',
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      this.error = ''

      try {
        const response = await dashboardService.fetchDashboard()

        this.raw = response.data || {}
        this.errors = response.errors || {}
        this.dashboard = buildDashboard(this.raw, this.errors)

        return this.dashboard
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Impossible de charger le dashboard.'

        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
