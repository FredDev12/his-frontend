const HISTORY_ROLES = Object.freeze([
  'ADMIN',
  'MEDECIN',
])

export function canReadClinicalHistory(auth) {
  const roleCode = String(
    auth?.roleCode || '',
  )
    .trim()
    .toUpperCase()

  return (
    HISTORY_ROLES.includes(roleCode) &&
    typeof auth?.hasPermission === 'function' &&
    auth.hasPermission('consultation:read')
  )
}

export function formatClinicalHistoryValue(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return 'Non renseigné'
  }

  return String(value)
}

export function clinicalHistoryActorLabel(item) {
  return (
    String(item?.actor?.name || '').trim() ||
    'Utilisateur non identifié'
  )
}

export function clinicalHistoryRoleLabel(roleCode) {
  const labels = {
    ADMIN: 'Administrateur',
    MEDECIN: 'Médecin',
  }

  const normalized = String(
    roleCode || '',
  )
    .trim()
    .toUpperCase()

  return labels[normalized] || normalized || 'Rôle non renseigné'
}

export function clinicalHistoryPageLabel(
  page,
  limit,
  count,
) {
  const safePage = Math.max(1, Number(page || 1))
  const safeLimit = Math.max(1, Number(limit || 20))
  const safeCount = Math.max(0, Number(count || 0))

  if (safeCount === 0) {
    return '0 modification'
  }

  const start =
    (safePage - 1) * safeLimit + 1
  const end = Math.min(
    safePage * safeLimit,
    safeCount,
  )

  return `${start}–${end} sur ${safeCount}`
}
