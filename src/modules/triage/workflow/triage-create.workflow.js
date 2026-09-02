export const TRIAGE_TYPE_OPTIONS = [
  {
    label: 'Consultation sans rendez-vous',
    value: 'CONSULTATION',
  },
  {
    label: 'Urgence — besoin d’une évaluation immédiate',
    value: 'URGENCE',
  },
  {
    label: 'Rendez-vous programmé',
    value: 'RENDEZ_VOUS',
  },
  {
    label: 'Patient référé par une autre structure',
    value: 'REFERE',
  },
]

export const TRIAGE_PRIORITY_OPTIONS = [
  {
    label: 'Routine — peut attendre en sécurité',
    value: 'ROUTINE',
  },
  {
    label: 'Urgent — prise en charge rapide',
    value: 'URGENT',
  },
  {
    label: 'Très urgent — prise en charge prioritaire',
    value: 'TRES_URGENT',
  },
  {
    label: 'Urgence vitale — prise en charge immédiate',
    value: 'VITALE',
  },
]

export const TRIAGE_ORIENTATION_OPTIONS = [
  {
    label: 'Consultation immédiate dans le service choisi',
    value: 'CONSULTATION',
  },
  {
    label: 'Rendez-vous de consultation à programmer',
    value: 'RDV_CONSULTATION',
  },
]

const TRIAGE_TYPE_LABELS = Object.fromEntries(
  TRIAGE_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const TRIAGE_PRIORITY_META = {
  ROUTINE: {
    label: 'Routine',
    description: 'Le patient peut attendre en sécurité selon l’évaluation réalisée.',
  },
  URGENT: {
    label: 'Urgent',
    description: 'Le patient nécessite une prise en charge rapide.',
  },
  TRES_URGENT: {
    label: 'Très urgent',
    description: 'Le patient doit être pris en charge en priorité.',
  },
  VITALE: {
    label: 'Urgence vitale',
    description: 'Le patient nécessite une prise en charge immédiate.',
  },
}

const TRIAGE_ORIENTATION_LABELS = Object.fromEntries(
  TRIAGE_ORIENTATION_OPTIONS.map((option) => [option.value, option.label]),
)

function asObject(value) {
  return value && typeof value === 'object' ? value : {}
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeWaitingMinutes(value) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return 0

  return Math.max(0, Math.trunc(parsed))
}

function normalizeWaitingLevel(value) {
  const normalized = String(value || '').toUpperCase()

  return ['STANDARD', 'WATCH', 'PROLONGED'].includes(normalized)
    ? normalized
    : 'STANDARD'
}

export function normalizeTriageQueueItem(value) {
  const raw = asObject(value)
  const patient = asObject(raw.patient)
  const episode = asObject(raw.episode)
  const reception = asObject(raw.reception)

  return {
    raw,
    patient: {
      id: String(patient.id || ''),
      patientCode: patient.patientCode || '',
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      middleName: patient.middleName || '',
      gender: patient.gender || '',
      birthDate: patient.birthDate || null,
      estimatedAge:
        patient.estimatedAge === null || patient.estimatedAge === undefined
          ? null
          : Number(patient.estimatedAge),
      phone: patient.phone || null,
    },
    episode: {
      id: String(episode.id || ''),
      episodeCode: episode.episodeCode || '',
      status: episode.status || '',
      createdAt: episode.createdAt || '',
    },
    reception: {
      id: String(reception.id || ''),
      receptionCode: reception.receptionCode || '',
      status: reception.status || '',
      patientType: reception.patientType || '',
      agentReference: reception.agentReference || null,
      relationToAgent: reception.relationToAgent || null,
      paymentRequired: Boolean(reception.paymentRequired),
      paymentValidated: Boolean(reception.paymentValidated),
      createdAt: reception.createdAt || '',
    },
    waitingSince: raw.waitingSince || episode.createdAt || '',
    waitingMinutes: normalizeWaitingMinutes(raw.waitingMinutes),
    waitingLevel: normalizeWaitingLevel(raw.waitingLevel),
  }
}

export function normalizeTriageQueueResponse(payload) {
  const data = asObject(payload?.data || payload)
  const items = Array.isArray(data.items)
    ? data.items.map(normalizeTriageQueueItem)
    : []

  const page = Number(data.page || 1)
  const limit = Number(data.limit || 20)
  const count = Number(data.count || items.length || 0)

  return {
    items,
    count,
    page,
    limit,
    hasNext: page * limit < count,
    hasPrev: page > 1,
  }
}

export function normalizeTriageServices(payload) {
  const data = asObject(payload?.data || payload)
  const items = Array.isArray(data.items) ? data.items : []

  return items
    .filter(
      (service) =>
        service?.id &&
        service?.active !== false &&
        service?.canReceiveTriage === true,
    )
    .map((service) => ({
      id: String(service.id),
      value: String(service.id),
      code: service.code || '',
      name: service.name || '',
      canReceiveTriage: true,
      site: service.site || null,
      label: service.site?.name
        ? `${service.name} — ${service.site.name}`
        : service.name,
    }))
}

export function triagePatientFullName(queueItem) {
  const patient = queueItem?.patient || {}

  return [patient.lastName, patient.middleName, patient.firstName]
    .filter(Boolean)
    .join(' ')
    .trim()
}

export function buildTriageCreatePayload(form, queueItem) {
  const episodeId = String(queueItem?.episode?.id || '')
  const targetModule = String(form.orientationTargetModule || '')
  const requestedServiceId = String(form.requestedServiceId || '')

  const appointmentDateTime =
    targetModule === 'RDV_CONSULTATION' && form.appointmentDateTime
      ? new Date(form.appointmentDateTime).toISOString()
      : null

  return {
    episodeId,
    motifInitial: String(form.motifInitial || '').trim(),
    typePassage: form.typePassage,
    priority: form.priority,
    requestedServiceId,

    vitals: {
      temperatureCelsius: Number(form.temperatureCelsius),
      bloodPressureSystolic: optionalNumber(form.bloodPressureSystolic),
      bloodPressureDiastolic: optionalNumber(form.bloodPressureDiastolic),
      heartRate: Number(form.heartRate),
      respiratoryRate: Number(form.respiratoryRate),
      oxygenSaturation: Number(form.oxygenSaturation),
      weightKg: optionalNumber(form.weightKg),
      heightCm: optionalNumber(form.heightCm),
      glucoseMgDl: optionalNumber(form.glucoseMgDl),
      painScore: optionalNumber(form.painScore),
    },

    firstAid: {
      performed: Boolean(form.firstAidPerformed),
      notes: form.firstAidPerformed
        ? String(form.firstAidNotes || '').trim() || null
        : null,
    },

    orientation: {
      targetModule,
      targetServiceId: requestedServiceId,
      doctorId: null,
      appointmentRequired: targetModule === 'RDV_CONSULTATION',
      appointmentDateTime,
    },
  }
}

export function isEmergencyTriagePriority(priority) {
  return ['URGENT', 'TRES_URGENT', 'VITALE'].includes(
    String(priority || '').toUpperCase(),
  )
}

export function isVitalTriagePriority(priority) {
  return String(priority || '').toUpperCase() === 'VITALE'
}

export function findVitalEmergencyService(services = []) {
  return (
    services.find(
      (service) =>
        String(service?.code || '').toUpperCase() ===
          'URGENCES' &&
        service?.canReceiveTriage === true,
    ) || null
  )
}

export function triageTypeLabel(value) {
  return TRIAGE_TYPE_LABELS[String(value || '').toUpperCase()] || value || '—'
}

export function triagePriorityPresentation(value) {
  return (
    TRIAGE_PRIORITY_META[String(value || '').toUpperCase()] || {
      label: value || 'Non définie',
      description: 'Priorité clinique non renseignée.',
    }
  )
}

export function triageOrientationLabel(value) {
  return (
    TRIAGE_ORIENTATION_LABELS[String(value || '').toUpperCase()] ||
    value ||
    '—'
  )
}

export function formatTriageDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}
