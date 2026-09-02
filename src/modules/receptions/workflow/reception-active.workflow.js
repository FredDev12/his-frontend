export const ACTIVE_RECEPTION_BLOCK_REASON = 'ACTIVE_RECEPTION_ALREADY_EXISTS'

export function hasBlockingActiveReception(preflightResult) {
  return Boolean(
    preflightResult?.decision === 'EXISTING_PATIENT' &&
      preflightResult?.blockReason === ACTIVE_RECEPTION_BLOCK_REASON &&
      preflightResult?.activeReception?.id,
  )
}

export function activeReceptionDetailsPath(preflightResult) {
  if (!hasBlockingActiveReception(preflightResult)) return null
  return `/receptions/${preflightResult.activeReception.id}`
}
