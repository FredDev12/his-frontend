const CLINICAL_FIELDS = Object.freeze([
  'illnessHistory',
  'medicalHistory',
  'clinicalExam',
  'provisionalDiagnosis',
  'treatmentPlan',
])

function normalizeText(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function clinicalFormFromConsultation(
  consultation,
) {
  return {
    illnessHistory:
      consultation?.histoire || '',
    medicalHistory:
      consultation?.antecedents || '',
    clinicalExam:
      consultation?.examen_clinique || '',
    provisionalDiagnosis:
      consultation?.diagnostique || '',
    treatmentPlan:
      consultation?.plan_prise_en_charge || '',
  }
}

export function clinicalFormSnapshot(form) {
  return Object.fromEntries(
    CLINICAL_FIELDS.map((field) => [
      field,
      normalizeText(form?.[field]),
    ]),
  )
}

export function hasClinicalChanges(
  form,
  initialSnapshot,
) {
  const current = clinicalFormSnapshot(form)

  return CLINICAL_FIELDS.some(
    (field) =>
      current[field] !==
      (initialSnapshot?.[field] ?? null),
  )
}

export function createClinicalUpdatePayload(
  form,
  expectedUpdatedAt,
  initialSnapshot,
) {
  const version = String(
    expectedUpdatedAt || '',
  ).trim()

  if (!version) {
    throw new Error(
      'Version du dossier clinique absente. Actualisez la consultation avant d’enregistrer.',
    )
  }

  const current = clinicalFormSnapshot(form)
  const payload = {
    expectedUpdatedAt: version,
  }

  for (const field of CLINICAL_FIELDS) {
    if (
      current[field] !==
      (initialSnapshot?.[field] ?? null)
    ) {
      payload[field] = current[field]
    }
  }

  if (
    Object.keys(payload).length === 1
  ) {
    throw new Error(
      'Aucune modification clinique à enregistrer.',
    )
  }

  return payload
}

export function canEditClinicalConsultation(
  auth,
  consultation,
) {
  const roleCode = String(
    auth?.roleCode || '',
  )
    .trim()
    .toUpperCase()

  const status = String(
    consultation?.statut || '',
  )
    .trim()
    .toUpperCase()

  const episodeStatus = String(
    consultation?.episode_status || '',
  )
    .trim()
    .toUpperCase()

  const actorId = String(
    auth?.user?.id || '',
  )

  const doctorId = String(
    consultation?.raw?.doctorUser?.id || '',
  )

  return (
    roleCode === 'MEDECIN' &&
    typeof auth?.hasPermission === 'function' &&
    auth.hasPermission('consultation:update') &&
    status === 'EN_COURS' &&
    episodeStatus === 'EN_CONSULTATION' &&
    Boolean(actorId) &&
    Boolean(doctorId) &&
    actorId === doctorId
  )
}

export function clinicalUpdateErrorMessage(
  error,
) {
  const messages = {
    CONSULTATION_CLINICAL_VERSION_CONFLICT:
      'Le dossier a été modifié depuis son chargement. Vos données locales n’ont pas été écrasées. Actualisez le dossier avant de réessayer.',
    CONSULTATION_NOT_IN_PROGRESS:
      'Cette consultation n’est plus en cours.',
    CONSULTATION_DOCTOR_SCOPE_DENIED:
      'Seul le médecin affecté peut modifier ce dossier clinique.',
    CONSULTATION_SERVICE_SCOPE_DENIED:
      'La consultation appartient à un autre service clinique.',
    INVALID_CONSULTATION_CLINICAL_PAYLOAD:
      'Les informations cliniques saisies sont invalides.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Enregistrement clinique impossible.'
  )
}

export function isClinicalVersionConflict(
  error,
) {
  return (
    error?.code ===
    'CONSULTATION_CLINICAL_VERSION_CONFLICT'
  )
}

export { CLINICAL_FIELDS }
