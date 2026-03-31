import api from "./axios"

export const getConsultations = (params) => api.get("/consultations", { params })

export const createConsultation = (data) => api.post("/consultations", data)

export const getConsultationById = (id) => api.get(`/consultations/${id}`)

export const updateConsultationById = (id, data) => api.patch(`/consultations/${id}`, data)

export const deleteConsultationById = (id) => api.delete(`/consultations/${id}`)