const EXAMEN_TYPES = Object.freeze([
  {
    value: 'LABORATOIRE',
    label: 'Laboratoire',
  },
  {
    value: 'RADIOLOGIE',
    label: 'Radiologie',
  },
  {
    value: 'ECHOGRAPHIE',
    label: 'Échographie',
  },
  {
    value: 'SCANNER',
    label: 'Scanner',
  },
  {
    value: 'IRM',
    label: 'IRM',
  },
  {
    value: 'AUTRE',
    label: 'Autre',
  },
])

const ALLOWED_EPISODE_STATUSES = Object.freeze([
  'EN_CONSULTATION',
  'EN_ATTENTE_RESULTATS',
])

export function canRequestConsultationExamen(
  auth,
  consultation,
) {
  const roleCode = String(
    auth?.roleCode || '',
  )
    .trim()
    .toUpperCase()

  const consultationStatus = String(
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
    auth.hasPermission('examen:create') &&
    consultationStatus === 'EN_COURS' &&
    ALLOWED_EPISODE_STATUSES.includes(
      episodeStatus,
    ) &&
    Boolean(actorId) &&
    Boolean(doctorId) &&
    actorId === doctorId
  )
}

export function createExamenRequestDraft(form) {
  const type = String(
    form?.type || '',
  ).trim()

  const name = String(
    form?.name || '',
  ).trim()

  const clinicalIndication = String(
    form?.clinicalIndication || '',
  ).trim()

  if (
    !EXAMEN_TYPES.some(
      (option) => option.value === type,
    )
  ) {
    throw new Error(
      'Sélectionnez un type d’examen valide.',
    )
  }

  if (
    name.length < 2 ||
    name.length > 150
  ) {
    throw new Error(
      'Le nom de l’examen doit contenir entre 2 et 150 caractères.',
    )
  }

  if (clinicalIndication.length > 500) {
    throw new Error(
      'L’indication clinique ne peut pas dépasser 500 caractères.',
    )
  }

  return {
    type,
    name,
    clinicalIndication:
      clinicalIndication || null,
  }
}

export function createConfirmedExamenRequest(
  draft,
) {
  return {
    ...createExamenRequestDraft(draft),
    confirmationAcknowledged: true,
  }
}

export function examenTypeLabel(type) {
  return (
    EXAMEN_TYPES.find(
      (option) => option.value === type,
    )?.label ||
    String(type || '')
  )
}

export function examenRequestErrorMessage(
  error,
) {
  const messages = {
    EXAMEN_REQUEST_ROLE_DENIED:
      'Seul un médecin peut demander cet examen.',
    EXAMEN_REQUEST_DOCTOR_SCOPE_DENIED:
      'Seul le médecin affecté peut demander un examen pour cette consultation.',
    EXAMEN_REQUEST_SERVICE_SCOPE_DENIED:
      'La consultation appartient à un autre service.',
    EXAMEN_REQUEST_CONSULTATION_NOT_ACTIVE:
      'Cette consultation n’est plus en cours.',
    EXAMEN_REQUEST_EPISODE_NOT_READY:
      'L’épisode n’est pas dans un état autorisant une demande d’examen.',
    EXAMEN_REQUEST_PATIENT_NOT_ACTIVE:
      'Le dossier patient n’est plus actif.',
    EXAMEN_LEGACY_CREATE_DISABLED:
      'La création libre d’examen est désactivée.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Demande d’examen impossible.'
  )
}

export {
  ALLOWED_EPISODE_STATUSES,
  EXAMEN_TYPES,
}

export const MAX_EXAMEN_BATCH_ITEMS = 20

export function createEmptyExamenRequestItem() {
  return {
    type: '',
    name: '',
    clinicalIndication: '',
  }
}

export function createExamenBatchDraft(form) {
  const items = Array.isArray(form?.items)
    ? form.items
    : []

  if (
    items.length < 1 ||
    items.length > MAX_EXAMEN_BATCH_ITEMS
  ) {
    throw new Error(
      'La demande doit contenir entre 1 et 20 examens.',
    )
  }

  return {
    items: items.map(
      (item) =>
        createExamenRequestDraft(item),
    ),
  }
}

export function createConfirmedExamenBatch(
  draft,
) {
  return {
    ...createExamenBatchDraft(draft),
    confirmationAcknowledged: true,
  }
}

export function examenBatchSummary(draft) {
  if (
    !draft ||
    !Array.isArray(draft.items)
  ) {
    return ''
  }

  return draft.items
    .map((item, index) => {
      const indication =
        item.clinicalIndication
          ? ` — indication : ${item.clinicalIndication}`
          : ''

      return `${index + 1}. ${examenTypeLabel(item.type)} — ${item.name}${indication}`
    })
    .join(' ; ')
}


