const STORAGE_KEY = 'his_hospital_services'

const DEFAULT_SERVICES = [
  {
    id: 1,
    code: 'FICHE-PUB',
    nom: 'Frais fiche patient public',
    categorie: 'Accueil',
    module_source: 'reception',
    prix_base: 5000,
    devise: 'CDF',
    remise_autorisee: false,
    remise_max: 0,
    necessite_paiement: true,
    visible_dans_facturation: true,
    visible_dans_reception: true,
    statut: 'active',
    ordre: 1,
    description: 'Frais appliqués aux patients publics lors de la création de fiche.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    code: 'FICHE-AGENT',
    nom: 'Frais fiche agent CAC',
    categorie: 'Accueil',
    module_source: 'reception',
    prix_base: 0,
    devise: 'CDF',
    remise_autorisee: true,
    remise_max: 100,
    necessite_paiement: false,
    visible_dans_facturation: true,
    visible_dans_reception: true,
    statut: 'active',
    ordre: 2,
    description: 'Frais exonérés pour agent CAC confirmé, conjoint ou enfant.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    code: 'CONS-GEN',
    nom: 'Consultation générale',
    categorie: 'Consultation',
    module_source: 'consultations',
    prix_base: 15000,
    devise: 'CDF',
    remise_autorisee: true,
    remise_max: 30,
    necessite_paiement: true,
    visible_dans_facturation: true,
    visible_dans_reception: false,
    statut: 'active',
    ordre: 3,
    description: 'Consultation médicale générale.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    code: 'LAB-GE',
    nom: 'Goutte épaisse',
    categorie: 'Laboratoire',
    module_source: 'laboratoire',
    prix_base: 8000,
    devise: 'CDF',
    remise_autorisee: true,
    remise_max: 20,
    necessite_paiement: true,
    visible_dans_facturation: true,
    visible_dans_reception: false,
    statut: 'active',
    ordre: 4,
    description: 'Examen laboratoire pour recherche de paludisme.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    code: 'IMG-ECHO',
    nom: 'Échographie',
    categorie: 'Imagerie',
    module_source: 'imagerie',
    prix_base: 25000,
    devise: 'CDF',
    remise_autorisee: true,
    remise_max: 20,
    necessite_paiement: true,
    visible_dans_facturation: true,
    visible_dans_reception: false,
    statut: 'active',
    ordre: 5,
    description: 'Acte d’imagerie médicale.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    code: 'PHAR-PROD',
    nom: 'Produit pharmacie',
    categorie: 'Pharmacie',
    module_source: 'pharmacie',
    prix_base: 0,
    devise: 'CDF',
    remise_autorisee: true,
    remise_max: 15,
    necessite_paiement: true,
    visible_dans_facturation: true,
    visible_dans_reception: false,
    statut: 'active',
    ordre: 6,
    description: 'Ligne générique pour produit pharmacie, prix variable selon produit.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function now() {
  return new Date().toISOString()
}

function readServices() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES))
    return DEFAULT_SERVICES
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES))
    return DEFAULT_SERVICES
  }
}

function writeServices(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1
}

function toBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function toNullableBoolean(value) {
  if (value === '' || value === undefined || value === null) return null
  if (value === true || value === 'true' || value === 1 || value === '1') return true
  if (value === false || value === 'false' || value === 0 || value === '0') return false
  return null
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function normalizePayload(payload = {}) {
  const remiseAutorisee = toBoolean(payload.remise_autorisee)

  return {
    code: String(payload.code || '')
      .trim()
      .toUpperCase()
      .replaceAll(' ', '-'),
    nom: String(payload.nom || '').trim(),
    categorie: String(payload.categorie || '').trim(),
    module_source: String(payload.module_source || 'autre').trim(),

    prix_base: Number(payload.prix_base ?? 0),
    devise: payload.devise || 'CDF',

    remise_autorisee: remiseAutorisee,
    remise_max: remiseAutorisee ? Number(payload.remise_max ?? 0) : 0,

    necessite_paiement: toBoolean(payload.necessite_paiement),
    visible_dans_facturation: toBoolean(payload.visible_dans_facturation),
    visible_dans_reception: toBoolean(payload.visible_dans_reception),

    statut: payload.statut || 'active',
    ordre: Number(payload.ordre ?? 0),
    description: payload.description || '',
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

function calculatePrice(service, remise = 0) {
  const prixBase = Number(service?.prix_base || 0)
  const remiseDemandee = Number(remise || 0)

  const remiseAutorisee = Boolean(service?.remise_autorisee)
  const remiseMax = Number(service?.remise_max || 0)

  const remiseAppliquee = remiseAutorisee ? Math.min(Math.max(remiseDemandee, 0), remiseMax) : 0

  const montantRemise = Math.round((prixBase * remiseAppliquee) / 100)
  const prixFinal = Math.max(0, prixBase - montantRemise)

  return {
    prix_base: prixBase,
    remise_demandee: remiseDemandee,
    remise_appliquee: remiseAppliquee,
    montant_remise: montantRemise,
    prix_final: prixFinal,
    devise: service?.devise || 'CDF',
  }
}

export const servicesService = {
  async list(params = {}) {
    const items = readServices().sort((a, b) => {
      const orderA = Number(a.ordre || 0)
      const orderB = Number(b.ordre || 0)

      if (orderA !== orderB) return orderA - orderB

      return String(a.nom).localeCompare(String(b.nom))
    })

    return paginate(items, params.page || 1, params.limit || params.limite || 10)
  },

  async search(filters = {}) {
    const q = normalizeText(filters.q)
    const statut = String(filters.statut || '').trim()
    const moduleSource = String(filters.module_source || '').trim()
    const categorie = normalizeText(filters.categorie)

    const visibleFacturation = toNullableBoolean(filters.visible_dans_facturation)
    const visibleReception = toNullableBoolean(filters.visible_dans_reception)

    const items = readServices().filter((service) => {
      const searchable = normalizeText(
        [
          service.code,
          service.nom,
          service.categorie,
          service.module_source,
          service.description,
        ].join(' '),
      )

      const matchesQ = !q || searchable.includes(q)
      const matchesStatut = !statut || service.statut === statut
      const matchesModule = !moduleSource || service.module_source === moduleSource
      const matchesCategorie = !categorie || normalizeText(service.categorie).includes(categorie)

      const matchesFacturation =
        visibleFacturation === null ||
        Boolean(service.visible_dans_facturation) === visibleFacturation

      const matchesReception =
        visibleReception === null || Boolean(service.visible_dans_reception) === visibleReception

      return (
        matchesQ &&
        matchesStatut &&
        matchesModule &&
        matchesCategorie &&
        matchesFacturation &&
        matchesReception
      )
    })

    return paginate(items, filters.page || 1, filters.limit || filters.limite || 10)
  },

  async getById(id) {
    const service = readServices().find((item) => String(item.id) === String(id))

    if (!service) {
      throw new Error('Service introuvable.')
    }

    return {
      data: service,
    }
  },

  async create(payload) {
    const items = readServices()
    const normalized = normalizePayload(payload)

    const codeExists = items.some(
      (item) => normalizeText(item.code) === normalizeText(normalized.code),
    )

    if (codeExists) {
      throw new Error('Ce code service existe déjà.')
    }

    const created = {
      id: nextId(items),
      ...normalized,
      created_at: now(),
      updated_at: now(),
    }

    items.unshift(created)
    writeServices(items)

    return {
      data: created,
    }
  },

  async update(id, payload) {
    const items = readServices()
    const index = items.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      throw new Error('Service introuvable.')
    }

    const normalized = normalizePayload(payload)

    const codeExists = items.some(
      (item) =>
        String(item.id) !== String(id) &&
        normalizeText(item.code) === normalizeText(normalized.code),
    )

    if (codeExists) {
      throw new Error('Ce code service est déjà utilisé.')
    }

    const updated = {
      ...items[index],
      ...normalized,
      updated_at: now(),
    }

    items[index] = updated
    writeServices(items)

    return {
      data: updated,
    }
  },

  async activate(id) {
    return this.updateStatus(id, 'active')
  },

  async deactivate(id) {
    return this.updateStatus(id, 'inactive')
  },

  async updateStatus(id, statut) {
    const items = readServices()
    const index = items.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      throw new Error('Service introuvable.')
    }

    const updated = {
      ...items[index],
      statut,
      updated_at: now(),
    }

    items[index] = updated
    writeServices(items)

    return {
      data: updated,
    }
  },

  async remove(id) {
    const items = readServices().filter((item) => String(item.id) !== String(id))
    writeServices(items)

    return {
      message: 'Service supprimé.',
    }
  },

  async calculatePrice(id, remise = 0) {
    const service = readServices().find((item) => String(item.id) === String(id))

    if (!service) {
      throw new Error('Service introuvable.')
    }

    return {
      data: {
        service,
        pricing: calculatePrice(service, remise),
      },
    }
  },

  async listForFacturation() {
    const items = readServices().filter(
      (service) => service.statut === 'active' && service.visible_dans_facturation,
    )

    return {
      data: items,
    }
  },

  async listForReception() {
    const items = readServices().filter(
      (service) => service.statut === 'active' && service.visible_dans_reception,
    )

    return {
      data: items,
    }
  },
}
