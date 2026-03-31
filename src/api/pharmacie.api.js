import api from "./axios"

export const getPharmacies = (params) => api.get("/pharmacie", { params })   

export const createPharmacie = (data) => api.post("/pharmacie", data)

export const getPharmacieById = (id) => api.get(`/pharmacie/${id}`)

export const updatePharmacieById = (id, data) => api.patch(`/pharmacie/${id}`, data)

export const deletePharmacieById = (id) => api.delete(`/pharmacie/${id}`)