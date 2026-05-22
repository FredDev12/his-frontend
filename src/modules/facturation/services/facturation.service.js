const STORAGE_KEY = 'his_factures'

const DEFAULT_FACTURES = [
  {
    id: 1,
    numero: 'FAC-2026-0001',
    numero_patient: 'PAT-001',
    numero_fiche: 'FICHE-001',
    nom: 'KABAMBA',
    postnom: '',
    prenom: 'Jean',
    telephone: '0990000000',
    statut: 'draft',
    devise: 'CDF',
    lignes: [
      {
        id: 1,
        libelle: 'Consultation générale',
        module: 'Consultation',
        quantite: 1,
        prix_unitaire: 15000,
        total: 15000,
      },
    ],
    sous_total: 15000,
    remise: 0,
    taxe: 0,
    total: 15000,
    notes: 'Facture initiale.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    issued_at: '',
    paid_at: '',
    cancelled_at: '',
  },
]

function now() {
  return new Date().toISOString()
}

function readFactures() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FACTURES))
    return DEFAULT_FACTURES
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FACTURES))
    return DEFAULT_FACTURES
  }
}

function writeFactures(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1
}

function generateInvoiceNumber(items) {
  const year = new Date().getFullYear()
  const nextNumber = nextId(items)
  return `FAC-${year}-${String(nextNumber).padStart(4, '0')}`
}

function calculateTotals(payload) {
  const lignes = Array.isArray(payload.lignes) ? payload.lignes : []

  const normalizedLines = lignes.map((line, index) => {
    const quantite = Number(line.quantite || 0)
    const prixUnitaire = Number(line.prix_unitaire || 0)

    return {
      id: line.id || index + 1,
      libelle: line.libelle || '',
      module: line.module || '',
      quantite,
      prix_unitaire: prixUnitaire,
      total: quantite * prixUnitaire,
    }
  })

  const sousTotal = normalizedLines.reduce((sum, line) => sum + Number(line.total || 0), 0)
  const remise = Number(payload.remise || 0)
  const taxe = Number(payload.taxe || 0)
  const total = Math.max(0, sousTotal - remise + taxe)

  return {
    lignes: normalizedLines,
    sous_total: sousTotal,
    remise,
    taxe,
    total,
  }
}

function paginate(items, page = 1, limit = 10) {
  const currentPage = Number(page) || 1
  const perPage = Number(limit) || 10
  const start = (currentPage - 1) * perPage
  const data = items.slice(start, start + perPage)
  const total = items.length
  const pages = Math.ceil(total / perPage) || 1

  return {
    data,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      pages,
    },
  }
}

export const facturationService = {
  async list(params = {}) {
    const items = readFactures().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return paginate(items, params.page || 1, params.limit || params.limite || 10)
  },

  async search(filters = {}) {
    const q = normalizeText(filters.q)
    const statut = String(filters.statut || '').trim()
    const date = String(filters.date || '').trim()

    const items = readFactures().filter((facture) => {
      const searchable = normalizeText(
        [
          facture.numero,
          facture.numero_patient,
          facture.numero_fiche,
          facture.nom,
          facture.postnom,
          facture.prenom,
          facture.telephone,
          facture.notes,
          facture.statut,
        ].join(' '),
      )

      const matchesQ = !q || searchable.includes(q)
      const matchesStatut = !statut || facture.statut === statut
      const matchesDate = !date || String(facture.created_at || '').startsWith(date)

      return matchesQ && matchesStatut && matchesDate
    })

    return paginate(items, filters.page || 1, filters.limit || filters.limite || 10)
  },

  async getById(id) {
    const facture = readFactures().find((item) => String(item.id) === String(id))

    if (!facture) {
      throw new Error('Facture introuvable.')
    }

    return { data: facture }
  },

  async create(payload) {
    const items = readFactures()
    const totals = calculateTotals(payload)

    const created = {
      id: nextId(items),
      numero: payload.numero || generateInvoiceNumber(items),
      numero_patient: payload.numero_patient,
      numero_fiche: payload.numero_fiche,
      nom: payload.nom,
      postnom: payload.postnom || '',
      prenom: payload.prenom,
      telephone: payload.telephone || '',
      statut: payload.statut || 'draft',
      devise: payload.devise || 'CDF',
      ...totals,
      notes: payload.notes || '',
      created_at: now(),
      updated_at: now(),
      issued_at: '',
      paid_at: '',
      cancelled_at: '',
    }

    items.unshift(created)
    writeFactures(items)

    return { data: created }
  },

  async update(id, payload) {
    const items = readFactures()
    const index = items.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      throw new Error('Facture introuvable.')
    }

    const previous = items[index]
    const totals = calculateTotals(payload)

    const updated = {
      ...previous,
      ...payload,
      ...totals,
      updated_at: now(),
    }

    items[index] = updated
    writeFactures(items)

    return { data: updated }
  },

  async issue(id) {
    const items = readFactures()
    const index = items.findIndex((item) => String(item.id) === String(id))

    if (index === -1) throw new Error('Facture introuvable.')

    const updated = {
      ...items[index],
      statut: 'issued',
      issued_at: now(),
      updated_at: now(),
    }

    items[index] = updated
    writeFactures(items)

    return { data: updated }
  },

  async markPaid(id) {
    const items = readFactures()
    const index = items.findIndex((item) => String(item.id) === String(id))

    if (index === -1) throw new Error('Facture introuvable.')

    const updated = {
      ...items[index],
      statut: 'paid',
      paid_at: now(),
      updated_at: now(),
    }

    items[index] = updated
    writeFactures(items)

    return { data: updated }
  },

  async cancel(id) {
    const items = readFactures()
    const index = items.findIndex((item) => String(item.id) === String(id))

    if (index === -1) throw new Error('Facture introuvable.')

    const updated = {
      ...items[index],
      statut: 'cancelled',
      cancelled_at: now(),
      updated_at: now(),
    }

    items[index] = updated
    writeFactures(items)

    return { data: updated }
  },

  async remove(id) {
    const items = readFactures().filter((item) => String(item.id) !== String(id))
    writeFactures(items)

    return { message: 'Facture supprimée.' }
  },
}
