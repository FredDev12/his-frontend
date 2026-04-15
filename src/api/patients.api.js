import api from "./axios"

export const getPatients = () => api.get("/patients")

export const createPatient = (data) => api.post("/patients", data)

export const searchPatients = (q) => api.get("/patients/search", { params: { q } })

export const getPatient = (id) => api.get(`/patients/${id}`)

export const updatePatient = (id, data) => api.patch(`/patients/${id}`, data)

export const deletePatient = (id) => api.delete(`/patients/${id}`)


