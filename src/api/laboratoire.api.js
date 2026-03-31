import api from "./axios"

export const getLaboratoires = (params) => api.get("/laboratoire", { params })

export const createLaboratoire = (data) => api.post("/laboratoire", data)

export const getLaboratoireById = (id) => api.get(`/laboratoire/${id}`)

export const updateLaboratoireById = (id, data) => api.patch(`/laboratoire/${id}`, data)

export const deleteLaboratoireById = (id) => api.delete(`/laboratoire/${id}`)