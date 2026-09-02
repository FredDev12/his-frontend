const REFRESH_REQUIRED_CODES = new Set([
  'CONSULTATION_ALREADY_STARTED',
  'EPISODE_NOT_READY_FOR_CONSULTATION',
  'CONSULTATION_ASSIGNED_TO_ANOTHER_DOCTOR',
  'CONSULTATION_SERVICE_SCOPE_DENIED',
])

export function canStartConsultation(auth) {
  const roleCode = String(auth?.roleCode || '')
    .trim()
    .toUpperCase()

  return (
    roleCode === 'MEDECIN' &&
    typeof auth?.hasPermission === 'function' &&
    auth.hasPermission('consultation:create')
  )
}

export function createConsultationStartPayload(episodeId) {
  const normalizedEpisodeId = String(episodeId || '').trim()

  if (!/^[0-9]+$/.test(normalizedEpisodeId)) {
    throw new Error(
      'L’épisode sélectionné est invalide.',
    )
  }

  return {
    episodeId: normalizedEpisodeId,
    confirmationAcknowledged: true,
  }
}

export function normalizeStartedConsultation(payload) {
  return (
    payload?.item ||
    payload?.data?.item ||
    payload?.consultation ||
    payload?.data ||
    payload ||
    null
  )
}

export function consultationStartErrorMessage(error) {
  const messages = {
    CONSULTATION_ALREADY_STARTED:
      'Cette consultation a déjà été commencée par un médecin.',
    EPISODE_NOT_READY_FOR_CONSULTATION:
      'Ce patient n’est plus en attente de consultation.',
    CONSULTATION_ASSIGNED_TO_ANOTHER_DOCTOR:
      'Ce patient est déjà affecté à un autre médecin.',
    CONSULTATION_SERVICE_SCOPE_DENIED:
      'Ce patient appartient à un autre service clinique.',
    CONSULTATION_SERVICE_CONTEXT_REQUIRED:
      'Votre compte médecin n’est affecté à aucun service clinique.',
    CONSULTATION_PATIENT_NOT_ACTIVE:
      'La fiche patient n’est plus active.',
    CSRF_INVALID:
      'La session a été renouvelée. Reprenez la confirmation.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'Impossible de commencer la consultation.'
  )
}

export function shouldRefreshQueueAfterStartError(error) {
  return REFRESH_REQUIRED_CODES.has(error?.code)
}
