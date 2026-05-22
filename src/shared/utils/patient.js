export function patientFullName(item = {}) {
  return [item.nom, item.postnom, item.prenom || item.prénom].filter(Boolean).join(' ').trim()
}
