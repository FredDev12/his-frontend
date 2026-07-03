import api from "@/shared/services/api"

function unwrapResponse(response) {
  return response?.data ?? response
}

export const dmeService = {
  async getPatientMedicalRecord(patientId) {
    const response = await api.get(`/patients/${patientId}/medical-record`)
    return unwrapResponse(response)
  },

  async getEpisodeTimeline(episodeId) {
    const response = await api.get(`/episodes/${episodeId}/timeline`)
    return unwrapResponse(response)
  },

  async getEpisodeSummary(episodeId) {
    const response = await api.get(`/episodes/${episodeId}/summary`)
    return unwrapResponse(response)
  },

  async getEpisodeAudit(episodeId) {
    const response = await api.get(`/episodes/${episodeId}/audit`)
    return unwrapResponse(response)
  },
}
