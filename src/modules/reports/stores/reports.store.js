import { defineStore } from 'pinia'
import { reportsService } from '@/modules/reports/services/reports.service'

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }

  return fallback
}

function extractItems(payload, preferredKeys = []) {
  if (Array.isArray(payload)) return payload

  for (const key of preferredKeys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  const possibleKeys = [
    'data',
    'items',
    'results',
    'resultats',
    'patients',
    'receptions',
    'triages',
    'consultations',
    'laboratoire',
    'imagerie',
    'pharmacie',
    'paiements',
    'sorties',
  ]

  for (const key of possibleKeys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  return []
}

function extractTotal(payload, items = []) {
  return Number(
    payload?.pagination?.total ||
      payload?.meta?.total ||
      payload?.total ||
      payload?.count ||
      items.length ||
      0,
  )
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function getDateValue(item) {
  return (
    pick(item, [
      'created_at',
      'createdAt',
      'date_creation',
      'date',
      'date_paiement',
      'datePaiement',
      'date_sortie',
      'dateSortie',
      'timestamp',
    ]) || ''
  )
}

function isWithinDateRange(item, filters) {
  const dateValue = getDateValue(item)

  if (!filters.date_from && !filters.date_to) return true
  if (!dateValue) return true

  const itemDate = new Date(dateValue)

  if (Number.isNaN(itemDate.getTime())) return true

  if (filters.date_from) {
    const from = new Date(`${filters.date_from}T00:00:00`)
    if (itemDate < from) return false
  }

  if (filters.date_to) {
    const to = new Date(`${filters.date_to}T23:59:59`)
    if (itemDate > to) return false
  }

  return true
}

function filterByDate(items, filters) {
  return items.filter((item) => isWithinDateRange(item, filters))
}

function countByStatus(items, statusValues = []) {
  const accepted = statusValues.map(normalizeText)

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
    const montant = Number(pick(item, ['montant', 'amount', 'total', 'prix', 'price'], 0))

    return sum + (Number.isNaN(montant) ? 0 : montant)
  }, 0)
}

function getCurrency(items) {
  return pick(items?.[0], ['devise', 'currency'], '') || 'CDF'
}

function buildReport(rawPayloads, filters) {
  const patients = filterByDate(extractItems(rawPayloads.patients, ['data', 'patients']), filters)
  const receptions = filterByDate(
    extractItems(rawPayloads.receptions, ['data', 'receptions']),
    filters,
  )
  const triage = filterByDate(
    extractItems(rawPayloads.triage, ['data', 'triage', 'triages']),
    filters,
  )
  const consultations = filterByDate(
    extractItems(rawPayloads.consultations, ['data', 'consultations']),
    filters,
  )
  const laboratoire = filterByDate(
    extractItems(rawPayloads.laboratoire, ['data', 'laboratoire', 'examens']),
    filters,
  )
  const imagerie = filterByDate(
    extractItems(rawPayloads.imagerie, ['data', 'imagerie', 'examens']),
    filters,
  )
  const pharmacie = filterByDate(
    extractItems(rawPayloads.pharmacie, ['data', 'pharmacie', 'prescriptions']),
    filters,
  )
  const paiements = filterByDate(
    extractItems(rawPayloads.paiements, ['data', 'paiements', 'payments']),
    filters,
  )
  const sorties = filterByDate(extractItems(rawPayloads.sorties, ['data', 'sorties']), filters)

  const totalPaiements = sumPayments(paiements)
  const paidCount = countByStatus(paiements, ['paid', 'paye', 'payé', 'valide', 'validé'])
  const pendingPayments = countByStatus(paiements, ['pending', 'attente', 'en_attente'])
  const cancelledPayments = countByStatus(paiements, ['cancelled', 'annule', 'annulé'])

  const urgentTriage = countContaining(
    triage,
    ['type_passage', 'typePassage', 'priorite', 'priorité', 'statut', 'status'],
    ['urgence', 'urgent', 'rouge'],
  )

  const deliveredPharmacy = countByStatus(pharmacie, ['delivered', 'delivre', 'délivré'])
  const pendingPharmacy = countByStatus(pharmacie, ['pending', 'attente', 'en_attente'])

  const validatedSorties = countByStatus(sorties, ['validated', 'valide', 'validé', 'sortie'])
  const pendingSorties = countByStatus(sorties, ['pending', 'attente', 'en_attente'])

  return {
    generated_at: new Date().toISOString(),

    kpis: {
      patients: patients.length,
      receptions: receptions.length,
      triage: triage.length,
      urgentTriage,
      consultations: consultations.length,
      laboratoire: laboratoire.length,
      imagerie: imagerie.length,
      pharmacie: pharmacie.length,
      paiements: paiements.length,
      sorties: sorties.length,
      totalPaiements,
      devise: getCurrency(paiements),
    },

    modules: [
      {
        key: 'patients',
        label: 'Patients',
        total: patients.length,
        description: 'Patients enregistrés dans la période.',
      },
      {
        key: 'receptions',
        label: 'Réceptions',
        total: receptions.length,
        description: 'Admissions et passages enregistrés.',
      },
      {
        key: 'triage',
        label: 'Triage / Urgences',
        total: triage.length,
        alert: urgentTriage,
        description: 'Évaluations triage et cas urgents.',
      },
      {
        key: 'consultations',
        label: 'Consultations',
        total: consultations.length,
        description: 'Consultations médicales réalisées.',
      },
      {
        key: 'laboratoire',
        label: 'Laboratoire',
        total: laboratoire.length,
        description: 'Demandes ou résultats laboratoire.',
      },
      {
        key: 'imagerie',
        label: 'Imagerie',
        total: imagerie.length,
        description: 'Demandes ou résultats imagerie.',
      },
      {
        key: 'pharmacie',
        label: 'Pharmacie',
        total: pharmacie.length,
        done: deliveredPharmacy,
        pending: pendingPharmacy,
        description: 'Prescriptions et délivrances.',
      },
      {
        key: 'paiements',
        label: 'Caisse / Paiements',
        total: paiements.length,
        done: paidCount,
        pending: pendingPayments,
        cancelled: cancelledPayments,
        description: 'Paiements enregistrés et validés.',
      },
      {
        key: 'sorties',
        label: 'Sorties patient',
        total: sorties.length,
        done: validatedSorties,
        pending: pendingSorties,
        description: 'Sorties clôturées ou en attente.',
      },
    ],

    finance: {
      total: totalPaiements,
      devise: getCurrency(paiements),
      paidCount,
      pendingPayments,
      cancelledPayments,
    },

    activity: {
      patients,
      receptions,
      triage,
      consultations,
      laboratoire,
      imagerie,
      pharmacie,
      paiements,
      sorties,
    },
  }
}

export const useReportsStore = defineStore('reports', {
  state: () => ({
    report: null,
    raw: {},
    errors: {},

    loading: false,
    error: '',

    filters: {
      date_from: '',
      date_to: '',
    },
  }),

  actions: {
    async fetchReports(filters = {}) {
      this.loading = true
      this.error = ''

      this.filters = {
        date_from: filters.date_from ?? this.filters.date_from,
        date_to: filters.date_to ?? this.filters.date_to,
      }

      try {
        const response = await reportsService.fetchAll({
          limit: 500,
        })

        this.raw = response.data || {}
        this.errors = response.errors || {}

        this.report = buildReport(this.raw, this.filters)

        return this.report
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Impossible de charger les rapports.'

        throw error
      } finally {
        this.loading = false
      }
    },

    resetFilters() {
      this.filters = {
        date_from: '',
        date_to: '',
      }
    },
  },
})
