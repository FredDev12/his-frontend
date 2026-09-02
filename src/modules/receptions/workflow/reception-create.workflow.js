function optionalText(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

function patientIdentity(patient = {}) {
  const identity = {
    firstName: String(patient.firstName ?? '').trim(),
    lastName: String(patient.lastName ?? '').trim(),
    gender: patient.gender,
    phone: optionalText(patient.phone),
  }

  const middleName = optionalText(patient.middleName)
  if (middleName) identity.middleName = middleName

  if (patient.birthDate) {
    identity.birthDate = patient.birthDate
  } else if (Number(patient.estimatedAge) > 0) {
    identity.estimatedAge = Number(patient.estimatedAge)
  }

  return identity
}

function patientCreateInput(patient = {}) {
  return {
    ...patientIdentity(patient),
    address: optionalText(patient.address),
    emergencyContactName: optionalText(patient.emergencyContactName),
    emergencyContactPhone: optionalText(patient.emergencyContactPhone),
  }
}

function administrativeContext(form) {
  const isPublic = form.patientType === 'PUBLIC'

  const context = {
    patientType: form.patientType,
    isAgent: form.patientType === 'AGENT_CAC',
    agentReference: isPublic ? null : optionalText(form.agentReference),
    relationToAgent: isPublic ? null : form.relationToAgent || null,
  }

  if (
    form.patientType === 'AYANT_DROIT' &&
    form.relationToAgent === 'SPOUSE'
  ) {
    context.spouseVerification = {
      documentType: form.spouseVerification?.documentType || '',
      documentReference: optionalText(
        form.spouseVerification?.documentReference,
      ),
    }
  }

  return context
}

/**
 * Construit la prévalidation par identité. Ce payload ne doit jamais réutiliser
 * silencieusement un patientId provenant d'une vérification devenue obsolète.
 */
export function buildReceptionIdentityPreflightPayload(form) {
  return {
    ...administrativeContext(form),
    patient: patientIdentity(form.patient),
  }
}

/**
 * Confirme explicitement une fiche choisie parmi les correspondances proposées.
 */
export function buildReceptionPatientSelectionPayload(form, patientId) {
  return {
    ...administrativeContext(form),
    patientId: String(patientId),
  }
}


export function isReceptionFichePaymentComplete(payment) {
  if (!payment?.currency || !payment?.mode) return false

  if (payment.mode === 'CASH') return true

  if (payment.mode !== 'MOBILE_MONEY') return false

  return Boolean(
    optionalText(payment.mobileMoneyProvider) &&
      optionalText(payment.payerPhone) &&
      optionalText(payment.reference),
  )
}

export function buildReceptionFichePaymentPayload(payment) {
  if (!isReceptionFichePaymentComplete(payment)) return null

  const payload = {
    currency: payment.currency,
    mode: payment.mode,
  }

  if (payment.mode === 'MOBILE_MONEY') {
    payload.mobileMoneyProvider = optionalText(payment.mobileMoneyProvider)
    payload.payerPhone = optionalText(payment.payerPhone)
    payload.reference = optionalText(payment.reference)
  }

  return payload
}

export function resolveReceptionFicheOpeningAmount(setting, currency) {
  const amount = Number(setting?.value?.amounts?.[currency])
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

/**
 * Une fiche existante est référencée par patientId. Une nouvelle fiche transmet
 * l'identité complète. L'ancien champ fichePaymentRequired n'est jamais envoyé.
 */
export function buildReceptionCreatePayload(
  form,
  preflightResult,
  duplicateResolution = null,
  fichePayment = null,
) {
  const payload = {
    ...administrativeContext(form),
    orientation: {
      targetModule: 'TRIAGE',
    },
  }

  if (
    preflightResult?.decision === 'EXISTING_PATIENT' &&
    preflightResult?.patient?.id
  ) {
    payload.patientId = String(preflightResult.patient.id)
    return payload
  }

  payload.patient = patientCreateInput(form.patient)

  const normalizedFichePayment = buildReceptionFichePaymentPayload(fichePayment)
  if (normalizedFichePayment) {
    payload.fichePayment = normalizedFichePayment
  }

  if (
    preflightResult?.decision === 'POSSIBLE_DUPLICATES' &&
    duplicateResolution?.action === 'CREATE_NEW'
  ) {
    payload.duplicateResolution = {
      action: 'CREATE_NEW',
      confirmation: 'AUCUNE_CORRESPONDANCE',
      candidateIds: [...new Set(duplicateResolution.candidateIds.map(String))],
    }
  }

  return payload
}

/**
 * Permet de détecter qu'une identité a changé après une prévalidation.
 */
export function buildReceptionIdentityFingerprint(form) {
  const identity = patientIdentity(form.patient)
  const context = administrativeContext(form)

  return JSON.stringify({ context, identity })
}
