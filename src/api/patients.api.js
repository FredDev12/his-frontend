import api from "./axios"

// LIST (tableau)
export const getPatients = () =>
  api.get("/patients")

// SEARCH
export const searchPatients = (q) =>
  api.get("/patients/search", { params: { q } })

// DETAIL
export const getPatient = (id) =>
  api.get(`/patients/${id}`)

// CRUD si tu en as aussi côté backend
export const createPatient = (data) =>
  api.post("/patients", data)

export const updatePatient = (id, data) =>
  api.put(`/patients/${id}`, data)

export const deletePatient = (id) =>
  api.delete(`/patients/${id}`)