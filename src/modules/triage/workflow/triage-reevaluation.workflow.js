import {
  TRIAGE_PRIORITY_OPTIONS,
  isVitalTriagePriority,
} from '@/modules/triage/workflow/triage-create.workflow'

const PRIORITY_RANK = {
  ROUTINE: 1,
  URGENT: 2,
  TRES_URGENT: 3,
  VITALE: 4,
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function reevaluationPriorityOptions(currentPriority) {
  const currentRank =
    PRIORITY_RANK[String(currentPriority || '').toUpperCase()] || 1

  return TRIAGE_PRIORITY_OPTIONS.filter(
    (option) => PRIORITY_RANK[option.value] >= currentRank,
  )
}

export function buildTriageReevaluationPayload(form) {
  return {
    newPriority: form.newPriority,

    vitals: {
      temperatureCelsius: Number(form.temperatureCelsius),
      bloodPressureSystolic: optionalNumber(
        form.bloodPressureSystolic,
      ),
      bloodPressureDiastolic: optionalNumber(
        form.bloodPressureDiastolic,
      ),
      heartRate: Number(form.heartRate),
      respiratoryRate: Number(form.respiratoryRate),
      oxygenSaturation: Number(form.oxygenSaturation),
      weightKg: optionalNumber(form.weightKg),
      heightCm: optionalNumber(form.heightCm),
      glucoseMgDl: optionalNumber(form.glucoseMgDl),
      painScore: optionalNumber(form.painScore),
    },

    clinicalNotes: String(form.clinicalNotes || '').trim(),

    vitalEmergencyConfirmed: Boolean(
      form.vitalEmergencyConfirmed,
    ),
  }
}

export function normalizeTriageReevaluation(value) {
  const raw = value || {}
  const vitals = raw.vitals || {}

  return {
    raw,
    id: String(raw.id || ''),
    sequenceNumber: Number(raw.sequenceNumber || 0),
    previousPriority: raw.previousPriority || '',
    newPriority: raw.newPriority || '',

    temperatureCelsius: Number(
      vitals.temperatureCelsius || 0,
    ),
    bloodPressureSystolic:
      vitals.bloodPressureSystolic ?? null,
    bloodPressureDiastolic:
      vitals.bloodPressureDiastolic ?? null,
    heartRate: Number(vitals.heartRate || 0),
    respiratoryRate: Number(vitals.respiratoryRate || 0),
    oxygenSaturation: Number(vitals.oxygenSaturation || 0),
    weightKg: vitals.weightKg ?? null,
    heightCm: vitals.heightCm ?? null,
    glucoseMgDl: vitals.glucoseMgDl ?? null,
    painScore: vitals.painScore ?? null,

    clinicalNotes: raw.clinicalNotes || '',
    emergencyEscalated: Boolean(raw.emergencyEscalated),
    vitalEmergencyConfirmed: Boolean(
      raw.vitalEmergencyConfirmed,
    ),

    createdByUser: raw.createdByUser || null,
    createdAt: raw.createdAt || '',
  }
}

export function normalizeTriageReevaluationList(payload) {
  const data = payload?.data || payload || {}
  const items = Array.isArray(data.items) ? data.items : []

  return items.map(normalizeTriageReevaluation)
}

export function isVitalReevaluation(form) {
  return isVitalTriagePriority(form?.newPriority)
}
