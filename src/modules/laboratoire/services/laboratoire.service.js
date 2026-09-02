import api from '@/shared/services/api'

const EXAMEN_TYPE = 'LABORATOIRE'

function unwrapPayload(response) {
  return response?.data?.data ?? response?.data ?? response
}

function normalizeList(payload) {
  const root = unwrapPayload(payload)

  const items = Array.isArray(root?.items)
    ? root.items
    : []

  const count = Number(
    root?.count ??
      root?.total ??
      items.length,
  )

  return {
    items,
    page: Number(root?.page ?? 1),
    limit: Number(root?.limit ?? 10),
    count,
    total: count,
  }
}

function normalizeItem(payload) {
  const root = unwrapPayload(payload)

  return (
    root?.item ??
    root?.data?.item ??
    root
  )
}

function normalizeLaboratoireExamen(item = {}) {
  const patient = item.patient ?? {}
  const episode = item.episode ?? {}

  return {
    ...item,

    examen: item.name ?? item.examen ?? '',
    nom: item.name ?? item.nom ?? '',
    resultat: item.resultText ?? item.resultat ?? '',
    conclusion:
      item.resultConclusion ??
      item.conclusion ??
      '',

    valide:
      item.status === 'RESULTAT_DISPONIBLE',

    patientName: [
      patient.lastName,
      patient.middleName,
      patient.firstName,
    ]
      .filter(Boolean)
      .join(' '),

    patientCode:
      patient.patientCode ??
      patient.code ??
      '',

    episodeCode:
      episode.episodeCode ??
      episode.code ??
      '',

    statut:
      item.status ?? '',

    date:
      item.resultAt ??
      item.requestedAt ??
      item.createdAt ??
      null,
  }
}

function examenListParams(params = {}) {
  const {
    statut,
    status,
    ...rest
  } = params

  const normalizedStatus =
    status ?? statut ?? ''

  return {
    ...rest,
    type: EXAMEN_TYPE,
    ...(normalizedStatus
      ? { status: normalizedStatus }
      : {}),
  }
}

async function countExamens(status) {
  const response = await api.get(
    '/examens',
    {
      params: {
        type: EXAMEN_TYPE,
        ...(status ? { status } : {}),
        page: 1,
        limit: 1,
      },
    },
  )

  return normalizeList(response).count
}

export const laboratoireService = {
  async list(params = {}) {
    const response = await api.get(
      '/examens',
      {
        params: examenListParams(params),
      },
    )

    const result = normalizeList(response)

    return {
      ...result,
      items: result.items.map(
        normalizeLaboratoireExamen,
      ),
    }
  },

  async kpis() {
    const [
      total,
      demandes,
      enCours,
      resultatsDisponibles,
    ] = await Promise.all([
      countExamens(),
      countExamens('DEMANDE'),
      countExamens('EN_COURS'),
      countExamens('RESULTAT_DISPONIBLE'),
    ])

    return {
      total,
      demandes,
      enCours,
      resultatsDisponibles,
      examensEnAttente:
        demandes + enCours,
      examensValides:
        resultatsDisponibles,
    }
  },

  async getById(id) {
    const response = await api.get(
      `/examens/${id}`,
    )

    return normalizeLaboratoireExamen(
      normalizeItem(response),
    )
  },

  async updateResult(id, payload) {
    const response = await api.patch(
      `/examens/${id}/result`,
      {
        resultText:
          String(
            payload?.resultText ??
            payload?.resultat ??
            '',
          ).trim(),

        resultConclusion:
          String(
            payload?.resultConclusion ??
            payload?.conclusion ??
            '',
          ).trim() || null,

        resultFileUrl:
          payload?.resultFileUrl ??
          null,
      },
    )

    return normalizeLaboratoireExamen(
      normalizeItem(response),
    )
  },

  async create() {
    throw new Error(
      'La création d’un examen est réservée à la consultation médicale.',
    )
  },

  async remove() {
    throw new Error(
      'La suppression d’un examen n’est pas autorisée depuis Laboratoire.',
    )
  },
}
