import api from "./axios"

export const getAudits = (params) => api.get("/audit", { params })

export const createAudit = (data) => api.post("/audit", data)

export const getAuditById = (id) => api.get(`/audit/${id}`)

export const updateAudit = (id, data) => api.patch(`/audit/${id}`, data)

export const deleteAudit = (id) => api.delete(`/audit/${id}`)