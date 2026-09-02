function firstNonEmpty(...values) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== '',
  )
}

export function patientFullName(item = {}) {
  const patient = item.patient || item.raw?.patient || {}

  const lastName = firstNonEmpty(
    item.nom,
    item.lastName,
    patient.lastName,
  )
  const middleName = firstNonEmpty(
    item.postnom,
    item.middleName,
    patient.middleName,
  )
  const firstName = firstNonEmpty(
    item.prenom,
    item.prénom,
    item.firstName,
    patient.firstName,
  )

  return [lastName, middleName, firstName]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .join(' ')
    .trim()
}

export function patientDisplayName(
  item = {},
  fallbackCode = '',
) {
  const fullName = patientFullName(item)

  if (fullName) return fullName

  const patient = item.patient || item.raw?.patient || {}
  const patientCode = firstNonEmpty(
    fallbackCode,
    item.numero_patient,
    item.patientCode,
    patient.patientCode,
  )

  return patientCode
    ? `Patient ${String(patientCode).trim()}`
    : 'Patient non identifié'
}
