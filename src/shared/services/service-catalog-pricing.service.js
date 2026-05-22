const STORAGE_KEY = 'his_hospital_services'

function readServices() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function calculate(service, remise = 0) {
  const prixBase = Number(service?.prix_base || 0)
  const remiseDemandee = Number(remise || 0)
  const remiseMax = Number(service?.remise_max || 0)

  const remiseAppliquee = service?.remise_autorisee
    ? Math.min(Math.max(remiseDemandee, 0), remiseMax)
    : 0

  const montantRemise = Math.round((prixBase * remiseAppliquee) / 100)
  const prixFinal = Math.max(0, prixBase - montantRemise)

  return {
    service_id: service?.id,
    code: service?.code,
    nom: service?.nom,
    prix_base: prixBase,
    remise_demandee: remiseDemandee,
    remise_appliquee: remiseAppliquee,
    montant_remise: montantRemise,
    prix_final: prixFinal,
    devise: service?.devise || 'CDF',
  }
}

export const serviceCatalogPricingService = {
  listActive() {
    return readServices().filter((service) => service.statut === 'active')
  },

  listForFacturation() {
    return readServices().filter(
      (service) => service.statut === 'active' && service.visible_dans_facturation,
    )
  },

  listForReception() {
    return readServices().filter(
      (service) => service.statut === 'active' && service.visible_dans_reception,
    )
  },

  getByCode(code) {
    return readServices().find((service) => service.code === code) || null
  },

  calculateByCode(code, remise = 0) {
    const service = this.getByCode(code)

    if (!service) return null

    return calculate(service, remise)
  },

  calculateByService(service, remise = 0) {
    return calculate(service, remise)
  },
}
