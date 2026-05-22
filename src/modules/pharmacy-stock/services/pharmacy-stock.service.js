const PRODUCTS_KEY = 'his_pharmacy_stock_products'
const MOVEMENTS_KEY = 'his_pharmacy_stock_movements'

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    code: 'MED-PARA-500',
    nom: 'Paracétamol 500mg',
    categorie: 'Antalgique',
    forme: 'Comprimé',
    unite: 'boîte',
    quantite: 120,
    seuil_alerte: 20,
    prix_unitaire: 2500,
    devise: 'CDF',
    fournisseur: 'Pharmacie centrale',
    emplacement: 'Rayon A1',
    statut: 'active',
    description: 'Antalgique et antipyrétique.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    code: 'MED-AMOX-500',
    nom: 'Amoxicilline 500mg',
    categorie: 'Antibiotique',
    forme: 'Gélule',
    unite: 'boîte',
    quantite: 15,
    seuil_alerte: 25,
    prix_unitaire: 8000,
    devise: 'CDF',
    fournisseur: 'Pharmacie centrale',
    emplacement: 'Rayon B2',
    statut: 'active',
    description: 'Antibiotique à délivrance contrôlée.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function now() {
  return new Date().toISOString()
}

function readProducts() {
  const stored = localStorage.getItem(PRODUCTS_KEY)

  if (!stored) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS))
    return DEFAULT_PRODUCTS
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS))
    return DEFAULT_PRODUCTS
  }
}

function writeProducts(items) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items))
}

function readMovements() {
  const stored = localStorage.getItem(MOVEMENTS_KEY)

  if (!stored) {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify([]))
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify([]))
    return []
  }
}

function writeMovements(items) {
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(items))
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

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1
}

function createMovement(product, type, quantity, reason = '') {
  const movements = readMovements()

  const movement = {
    id: nextId(movements),
    product_id: product.id,
    product_code: product.code,
    product_name: product.nom,
    type,
    quantity,
    stock_after: product.quantite,
    reason,
    created_at: now(),
  }

  movements.unshift(movement)
  writeMovements(movements)

  return movement
}

export const pharmacyStockService = {
  async list(params = {}) {
    const products = readProducts().sort((a, b) => String(a.nom).localeCompare(String(b.nom)))
    return paginate(products, params.page || 1, params.limit || params.limite || 10)
  },

  async search(filters = {}) {
    const q = normalizeText(filters.q)
    const statut = String(filters.statut || '').trim()
    const categorie = normalizeText(filters.categorie)
    const stockState = String(filters.stock_state || '').trim()

    const items = readProducts().filter((item) => {
      const searchable = normalizeText(
        [
          item.code,
          item.nom,
          item.categorie,
          item.forme,
          item.unite,
          item.fournisseur,
          item.emplacement,
          item.description,
        ].join(' '),
      )

      const isLowStock = Number(item.quantite || 0) <= Number(item.seuil_alerte || 0)
      const isOut = Number(item.quantite || 0) <= 0

      const matchesQ = !q || searchable.includes(q)
      const matchesStatut = !statut || item.statut === statut
      const matchesCategorie = !categorie || normalizeText(item.categorie).includes(categorie)

      const matchesStockState =
        !stockState ||
        (stockState === 'low' && isLowStock && !isOut) ||
        (stockState === 'out' && isOut) ||
        (stockState === 'ok' && !isLowStock && !isOut)

      return matchesQ && matchesStatut && matchesCategorie && matchesStockState
    })

    return paginate(items, filters.page || 1, filters.limit || filters.limite || 10)
  },

  async getById(id) {
    const product = readProducts().find((item) => String(item.id) === String(id))

    if (!product) {
      throw new Error('Produit introuvable.')
    }

    return { data: product }
  },

  async create(payload) {
    const products = readProducts()
    const created = {
      id: nextId(products),
      code: payload.code,
      nom: payload.nom,
      categorie: payload.categorie || '',
      forme: payload.forme || '',
      unite: payload.unite || 'unité',
      quantite: Number(payload.quantite || 0),
      seuil_alerte: Number(payload.seuil_alerte || 0),
      prix_unitaire: Number(payload.prix_unitaire || 0),
      devise: payload.devise || 'CDF',
      fournisseur: payload.fournisseur || '',
      emplacement: payload.emplacement || '',
      statut: payload.statut || 'active',
      description: payload.description || '',
      created_at: now(),
      updated_at: now(),
    }

    products.unshift(created)
    writeProducts(products)

    createMovement(created, 'INITIAL', created.quantite, 'Stock initial')

    return { data: created }
  },

  async update(id, payload) {
    const products = readProducts()
    const index = products.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      throw new Error('Produit introuvable.')
    }

    const previous = products[index]

    const updated = {
      ...previous,
      ...payload,
      quantite: Number(payload.quantite ?? previous.quantite ?? 0),
      seuil_alerte: Number(payload.seuil_alerte ?? previous.seuil_alerte ?? 0),
      prix_unitaire: Number(payload.prix_unitaire ?? previous.prix_unitaire ?? 0),
      updated_at: now(),
    }

    products[index] = updated
    writeProducts(products)

    return { data: updated }
  },

  async moveStock(id, payload) {
    const products = readProducts()
    const index = products.findIndex((item) => String(item.id) === String(id))

    if (index === -1) {
      throw new Error('Produit introuvable.')
    }

    const product = products[index]
    const quantity = Number(payload.quantity || 0)
    const type = payload.type

    if (!quantity || quantity <= 0) {
      throw new Error('La quantité doit être supérieure à zéro.')
    }

    let nextQuantity = Number(product.quantite || 0)

    if (type === 'IN') {
      nextQuantity += quantity
    } else if (type === 'OUT') {
      if (quantity > nextQuantity) {
        throw new Error('Stock insuffisant pour cette sortie.')
      }

      nextQuantity -= quantity
    } else if (type === 'ADJUST') {
      nextQuantity = quantity
    } else {
      throw new Error('Type de mouvement invalide.')
    }

    const updated = {
      ...product,
      quantite: nextQuantity,
      updated_at: now(),
    }

    products[index] = updated
    writeProducts(products)

    createMovement(updated, type, quantity, payload.reason || '')

    return { data: updated }
  },

  async remove(id) {
    const products = readProducts().filter((item) => String(item.id) !== String(id))
    writeProducts(products)

    return { message: 'Produit supprimé.' }
  },

  async movements(productId = null) {
    const movements = readMovements()
      .filter((item) => !productId || String(item.product_id) === String(productId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return { data: movements }
  },
}
