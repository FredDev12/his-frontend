const STORAGE_KEY = 'his_rendez_vous'

const DEFAULT_RDV = [
  {
    id: 1,
    numero_patient: 'PAT-001',
    numero_fiche: 'FICHE-001',
    nom: 'KABAMBA',
    postnom: '',
    prenom: 'Jean',
    telephone: '0990000000',
    service: 'Consultation',
    medecin: 'Médecin de garde',
    motif: 'Consultation générale',
    date_rdv: new Date().toISOString().split('T')[0],
    heure_rdv: '09:00',
    statut: 'scheduled',
    notes: 'Premier rendez-vous.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function readRdv() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RDV))
    return DEFAULT_RDV
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RDV))
    return DEFAULT_RDV
  }
}

function writeRdv(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
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

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export const rendezVousService = {
  async list(params = {}) {
    const items = readRdv().sort((a, b) => {
      const dateA = new Date(`${a.date_rdv || ''}T${a.heure_rdv || '00:00'}`)
      const dateB = new Date(`${b.date_rdv || ''}T${b.heure_rdv || '00:00'}`)
      return dateB - dateA
    })

    return paginate(items, params.page || 1, params.limit || params.limite || 10)
  },

  async search(filters = {}) {
    const q = normalizeText(filters.q)
    const statut = String(filters.statut || '').trim()
    const service = String(filters.service || '').trim()
    const date = String(filters.date_rdv || '').trim()

    const items = readRdv().filter((rdv) => {
      const searchable = normalizeText(
        [
          rdv.numero_patient,
          rdv.numero_fiche,
          rdv.nom,
          rdv.postnom,
          rdv.prenom,
          rdv.telephone,
          rdv.service,
          rdv.medecin,
          rdv.motif,
          rdv.notes,
        ].join(' '),
      )

      const matchesQ = !q || searchable.includes(q)
      const matchesStatut = !statut || rdv.statut === statut
      const matchesService = !service || rdv.service === service
      const matchesDate = !date || rdv.date_rdv === date

      return matchesQ && matchesStatut && matchesService && matchesDate
    })

    return paginate(items, filters.page || 1, filters.limit || filters.limite || 10)
  },

  async getById(id) {
    const rdv = readRdv().find((item) => String(item.id) === String(id))

    if (!rdv) {
      throw new Error('Rendez-vous introuvable.')
    }

    return {
      data: rdv,
    }
  },

  async create(payload) {
    const items = readRdv()

    const nextId = items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1

    const now = new Date().toISOString()

    const created = {
      id: nextId,
      ...payload,
      statut: payload.statut || 'scheduled',
      created_at: now,
      updated_at: now,
    }

    items.unshift(created)
    writeRdv(items)

    return {
      data: created,
    }
  },

  async update(id, payload) {
    const items = readRdv()
    const index = items.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      throw new Error('Rendez-vous introuvable.')
    }

    const updated = {
      ...items[index],
      ...payload,
      updated_at: new Date().toISOString(),
    }

    items[index] = updated
    writeRdv(items)

    return {
      data: updated,
    }
  },

  async remove(id) {
    const items = readRdv().filter((item) => String(item.id) !== String(id))
    writeRdv(items)

    return {
      message: 'Rendez-vous supprimé.',
    }
  },
}
