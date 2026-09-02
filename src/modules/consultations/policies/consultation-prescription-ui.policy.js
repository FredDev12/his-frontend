const MAX_PRESCRIPTION_LINES = 50

function normalizeText(value) {
  return String(value ?? '').trim()
}

function normalizeQuantity(value) {
  const raw = normalizeText(value)

  if (!/^\d+$/.test(raw)) {
    return null
  }

  const quantity = Number(raw)

  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > 10000
  ) {
    return null
  }

  return quantity
}

export function createEmptyPrescriptionLine() {
  return {
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: '',
  }
}

export function canCreateConsultationPrescription(
  auth,
  consultation,
) {
  const roleCode = normalizeText(
    auth?.roleCode,
  ).toUpperCase()

  const consultationStatus = normalizeText(
    consultation?.statut,
  ).toUpperCase()

  const episodeStatus = normalizeText(
    consultation?.episode_status,
  ).toUpperCase()

  const actorId = normalizeText(
    auth?.user?.id,
  )

  const doctorId = normalizeText(
    consultation?.raw?.doctorUser?.id,
  )

  return (
    roleCode === 'MEDECIN' &&
    typeof auth?.hasPermission === 'function' &&
    auth.hasPermission('prescription:create') &&
    consultationStatus === 'EN_COURS' &&
    episodeStatus === 'EN_CONSULTATION' &&
    Boolean(actorId) &&
    Boolean(doctorId) &&
    actorId === doctorId
  )
}

function normalizePrescriptionLine(
  line,
  index,
) {
  const medicationName = normalizeText(
    line?.medicationName,
  )
  const dosage = normalizeText(
    line?.dosage,
  )
  const frequency = normalizeText(
    line?.frequency,
  )
  const duration = normalizeText(
    line?.duration,
  )
  const quantity = normalizeQuantity(
    line?.quantity,
  )
  const instructions = normalizeText(
    line?.instructions,
  )

  const label = `Ligne ${index + 1}`

  if (
    medicationName.length < 2 ||
    medicationName.length > 150
  ) {
    throw new Error(
      `${label} : le médicament doit contenir entre 2 et 150 caractères.`,
    )
  }

  if (
    dosage.length < 1 ||
    dosage.length > 120
  ) {
    throw new Error(
      `${label} : le dosage est obligatoire et limité à 120 caractères.`,
    )
  }

  if (
    frequency.length < 1 ||
    frequency.length > 120
  ) {
    throw new Error(
      `${label} : la fréquence est obligatoire et limitée à 120 caractères.`,
    )
  }

  if (
    duration.length < 1 ||
    duration.length > 120
  ) {
    throw new Error(
      `${label} : la durée est obligatoire et limitée à 120 caractères.`,
    )
  }

  if (quantity === null) {
    throw new Error(
      `${label} : la quantité doit être un entier compris entre 1 et 10000.`,
    )
  }

  if (instructions.length > 500) {
    throw new Error(
      `${label} : les instructions sont limitées à 500 caractères.`,
    )
  }

  return {
    medicationName,
    dosage,
    frequency,
    duration,
    quantity,
    instructions:
      instructions || null,
  }
}

export function createPrescriptionDraft(
  form,
) {
  const clinicalNotes = normalizeText(
    form?.clinicalNotes,
  )

  if (clinicalNotes.length > 500) {
    throw new Error(
      'Les notes cliniques sont limitées à 500 caractères.',
    )
  }

  const sourceLines = Array.isArray(
    form?.lines,
  )
    ? form.lines
    : []

  if (
    sourceLines.length < 1 ||
    sourceLines.length >
      MAX_PRESCRIPTION_LINES
  ) {
    throw new Error(
      'La prescription doit contenir entre 1 et 50 lignes.',
    )
  }

  return {
    clinicalNotes:
      clinicalNotes || null,
    lines: sourceLines.map(
      normalizePrescriptionLine,
    ),
  }
}

export function createConfirmedPrescription(
  draft,
) {
  return {
    ...createPrescriptionDraft(draft),
    confirmationAcknowledged: true,
  }
}

export function prescriptionSummary(
  draft,
) {
  if (
    !draft ||
    !Array.isArray(draft.lines)
  ) {
    return ''
  }

  return draft.lines
    .map(
      (line) =>
        `${line.medicationName} — ${line.dosage}, ${line.frequency}, ${line.duration}, quantité ${line.quantity}`,
    )
    .join(' ; ')
}

export function prescriptionErrorMessage(
  error,
) {
  const messages = {
    PRESCRIPTION_ROLE_DENIED:
      'Seul un médecin peut prescrire.',
    PRESCRIPTION_DOCTOR_SCOPE_DENIED:
      'Seul le médecin affecté peut prescrire pour cette consultation.',
    PRESCRIPTION_SERVICE_SCOPE_DENIED:
      'La consultation appartient à un autre service.',
    PRESCRIPTION_CONSULTATION_NOT_ACTIVE:
      'Cette consultation n’est plus en cours.',
    PRESCRIPTION_EPISODE_NOT_READY:
      'La prescription n’est disponible que lorsque le patient est revenu en consultation.',
    PRESCRIPTION_PATIENT_NOT_ACTIVE:
      'Le dossier patient n’est plus actif.',
    PRESCRIPTION_ACTOR_SERVICE_UNAVAILABLE:
      'Le service clinique du médecin est indisponible.',
    PRESCRIPTION_LEGACY_CREATE_DISABLED:
      'La création libre de prescription est désactivée.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Prescription impossible.'
  )
}

export {
  MAX_PRESCRIPTION_LINES,
}
