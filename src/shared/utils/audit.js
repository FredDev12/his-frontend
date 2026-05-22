import { auditClientService } from '@/shared/services/audit-client.service'

export async function auditAction({
  action,
  entity,
  entityId,
  numero_fiche = '',
  numero_patient = '',
  patient = '',
  oldValue = null,
  newValue = null,
  details = {},
  auditLevel = 'INFO',
}) {
  return auditClientService.auditSafe({
    action,
    entity,
    entityId,
    numero_fiche,
    numero_patient,
    patient,
    oldValue,
    newValue,
    details,
    auditLevel,
  })
}
